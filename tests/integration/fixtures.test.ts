import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { scanWorkspace } from '@apisentry/analyzer';

describe('Integration Fixture Scans', () => {
  const fixturesDir = path.resolve(__dirname, '../../fixtures');

  it('scans valid-express-react fixture with zero contract issues', async () => {
    const result = await scanWorkspace(path.join(fixturesDir, 'valid-express-react'));
    expect(result.issues).toHaveLength(0);
    expect(result.consumers.length).toBeGreaterThan(0);
    expect(result.providers.length).toBeGreaterThan(0);
  });

  it('scans missing-endpoint fixture and reports ENDPOINT_NOT_FOUND', async () => {
    const result = await scanWorkspace(path.join(fixturesDir, 'missing-endpoint'));
    const missing = result.issues.filter(i => i.type === 'ENDPOINT_NOT_FOUND');
    expect(missing.length).toBe(1);
    expect(missing[0].consumer?.path).toBe('/api/orders');
  });

  it('scans method-mismatch fixture and reports METHOD_MISMATCH', async () => {
    const result = await scanWorkspace(path.join(fixturesDir, 'method-mismatch'));
    const mismatch = result.issues.filter(i => i.type === 'METHOD_MISMATCH');
    expect(mismatch.length).toBe(1);
    expect(mismatch[0].message).toContain('Method mismatch');
  });

  it('scans nested-router fixture and resolves route prefix correctly', async () => {
    const result = await scanWorkspace(path.join(fixturesDir, 'nested-router'));
    expect(result.providers).toHaveLength(1);
    expect(result.providers[0].path).toBe('/api/v1/users/:id');
    expect(result.issues).toHaveLength(0);
  });

  it('scans zod-validation fixture with clean matching', async () => {
    const result = await scanWorkspace(path.join(fixturesDir, 'zod-validation'));
    expect(result.issues).toHaveLength(0);
  });

  it('scans response-mismatch fixture and reports RESPONSE_FIELD_MISSING', async () => {
    const result = await scanWorkspace(path.join(fixturesDir, 'response-mismatch'));
    const missing = result.issues.filter(i => i.type === 'RESPONSE_FIELD_MISSING');
    expect(missing.length).toBe(1);
    expect(missing[0].message).toContain('email');
  });

  it('scans dynamic-endpoint fixture cleanly', async () => {
    const result = await scanWorkspace(path.join(fixturesDir, 'dynamic-endpoint'));
    expect(result.issues).toHaveLength(0);
  });
});
