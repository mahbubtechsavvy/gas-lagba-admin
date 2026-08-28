import 'server-only';
import { redirect } from 'next/navigation';
import { api, ApiError } from './api';
import { readSession } from './session';

export interface AdminMe {
  id: string;
  email: string;
  roleKey: string | null;
  isSuperAdmin: boolean;
  permissions: string[];
}

/**
 * Resolves the signed-in admin or redirects to /sign-in. Permissions here drive the
 * UI only — the API re-checks every request (frontend gating is UX, never security).
 */
export async function requireAdmin(): Promise<AdminMe> {
  const session = await readSession();
  if (!session) {
    redirect('/sign-in');
  }
  try {
    return await api<AdminMe>('/admin/me');
  } catch (err) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
      redirect(err.status === 403 ? '/sign-in?reason=not-admin' : '/sign-in?reason=expired');
    }
    throw err;
  }
}

export function can(me: AdminMe, permission: string): boolean {
  return me.isSuperAdmin || me.permissions.includes('*') || me.permissions.includes(permission);
}
