import { describe, it, expect } from 'vitest';
import { matchPaths } from '@apisentry/contract-engine';

describe('pathMatcher', () => {
  it('matches exact static paths', () => {
    expect(matchPaths('/api/users', '/api/users')).toBe(true);
    expect(matchPaths('/api/register', '/api/register')).toBe(true);
  });

  it('matches dynamic parameters', () => {
    expect(matchPaths('/api/users/123', '/api/users/:id')).toBe(true);
    expect(matchPaths('/api/users/:userId', '/api/users/:id')).toBe(true);
  });

  it('returns false for different path segments', () => {
    expect(matchPaths('/api/users', '/api/orders')).toBe(false);
    expect(matchPaths('/api/users/123/posts', '/api/users/123')).toBe(false);
  });
});
