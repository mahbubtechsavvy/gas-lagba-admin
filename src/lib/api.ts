import 'server-only';
import { env } from './env';
import { readSession, writeSession } from './session';

/** Mirrors the API error envelope (`docs/02-backend/API.md`). */
export interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: ApiErrorBody,
  ) {
    super(body.message);
    this.name = 'ApiError';
  }
}

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  /** Skip the bearer header (sign-in endpoints). */
  anonymous?: boolean;
  /** Internal: prevents infinite refresh loops. */
  _retried?: boolean;
}

/**
 * Server-side API client. Adds the admin bearer token from the session cookies, sends
 * a request id for log correlation, and on a 401 tries one refresh-token rotation
 * before giving up. Never called from the browser.
 */
export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = new URL(`${env.apiBaseUrl()}/api/v1${path}`);
  for (const [k, v] of Object.entries(options.query ?? {})) {
    if (v !== undefined && v !== '') {
      url.searchParams.set(k, String(v));
    }
  }
  const headers: Record<string, string> = {
    accept: 'application/json',
    'x-request-id': `admin-${crypto.randomUUID()}`,
  };
  if (options.body !== undefined) {
    headers['content-type'] = 'application/json';
  }
  let session = null;
  if (!options.anonymous) {
    session = await readSession();
    if (session?.accessToken) {
      headers['authorization'] = `Bearer ${session.accessToken}`;
    }
  }

  const res = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  });

  if (res.status === 401 && !options.anonymous && !options._retried && session?.refreshToken) {
    const refreshed = await tryRefresh(session.refreshToken);
    if (refreshed) {
      return api<T>(path, { ...options, _retried: true });
    }
  }

  if (res.status === 204) {
    return undefined as T;
  }
  const text = await res.text();
  const json: unknown = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const body = (json as { error?: ApiErrorBody } | null)?.error ?? { code: 'INTERNAL', message: `API responded ${res.status}` };
    throw new ApiError(res.status, body);
  }
  return json as T;
}

async function tryRefresh(refreshToken: string): Promise<boolean> {
  try {
    const session = await api<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
      anonymous: true,
      _retried: true,
    });
    await writeSession({ accessToken: session.accessToken, refreshToken: session.refreshToken });
    return true;
  } catch {
    return false;
  }
}

/** Builds a query object from a URL search-params-like input, dropping empties. */
export function pick(params: Record<string, string | string[] | undefined>, keys: string[]): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const k of keys) {
    const v = params[k];
    out[k] = Array.isArray(v) ? v[0] : v;
  }
  return out;
}
