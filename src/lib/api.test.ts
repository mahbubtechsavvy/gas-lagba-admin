import { describe, expect, it } from 'vitest';
import { pick } from './api';

describe('pick', () => {
  it('flattens search params to the requested keys', () => {
    expect(pick({ q: ['a', 'b'], kind: 'ADMIN', other: 'x' }, ['q', 'kind', 'status'])).toEqual({ q: 'a', kind: 'ADMIN', status: undefined });
  });
});
