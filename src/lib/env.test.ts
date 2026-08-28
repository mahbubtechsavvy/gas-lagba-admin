import { afterEach, describe, expect, it } from 'vitest';
import { env } from './env';

const original = { ...process.env };
/** `process.env.NODE_ENV` is typed read-only by Next's ambient types; tests still need to set it. */
const mutable = process.env as Record<string, string | undefined>;

afterEach(() => {
  process.env = { ...original };
});

// DEV-LOGIN-BACKDOOR — delete this whole file's dev-login block with the backdoor itself.
describe('env.devLoginEnabled', () => {
  it('is off unless DEV_LOGIN_ENABLED is exactly "true"', () => {
    mutable['NODE_ENV'] = 'development';
    delete mutable['DEV_LOGIN_ENABLED'];
    expect(env.devLoginEnabled()).toBe(false);
    mutable['DEV_LOGIN_ENABLED'] = '1';
    expect(env.devLoginEnabled()).toBe(false);
    mutable['DEV_LOGIN_ENABLED'] = 'true';
    expect(env.devLoginEnabled()).toBe(true);
  });

  it('stays off in a production build even when the flag is set', () => {
    mutable['NODE_ENV'] = 'production';
    mutable['DEV_LOGIN_ENABLED'] = 'true';
    expect(env.devLoginEnabled()).toBe(false);
  });
});
