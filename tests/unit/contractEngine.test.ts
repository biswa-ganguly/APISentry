import { describe, it, expect } from 'vitest';
import { ContractEngine } from '@apisentry/contract-engine';
import { ApiSentryConfigSchema } from '@apisentry/config';
import { ApiConsumer, ApiProvider } from '@apisentry/types';

describe('ContractEngine unit tests', () => {
  const config = ApiSentryConfigSchema.parse({});
  const engine = new ContractEngine(config);

  it('detects ENDPOINT_NOT_FOUND when route missing on backend', () => {
    const consumer: ApiConsumer = {
      id: 'c1',
      method: 'GET',
      path: '/api/orders',
      location: { filePath: '/src/api.ts', startLine: 1, startColumn: 1 },
      source: { adapter: 'axios' }
    };

    const issues = engine.match([consumer], []);
    expect(issues).toHaveLength(1);
    expect(issues[0].type).toBe('ENDPOINT_NOT_FOUND');
  });

  it('detects METHOD_MISMATCH when path matches but HTTP method differs', () => {
    const consumer: ApiConsumer = {
      id: 'c1',
      method: 'POST',
      path: '/api/profile',
      location: { filePath: '/src/api.ts', startLine: 1, startColumn: 1 },
      source: { adapter: 'axios' }
    };

    const provider: ApiProvider = {
      id: 'p1',
      method: 'PUT',
      path: '/api/profile',
      location: { filePath: '/src/server.ts', startLine: 1, startColumn: 1 },
      source: { adapter: 'express' }
    };

    const issues = engine.match([consumer], [provider]);
    expect(issues).toHaveLength(1);
    expect(issues[0].type).toBe('METHOD_MISMATCH');
  });
});
