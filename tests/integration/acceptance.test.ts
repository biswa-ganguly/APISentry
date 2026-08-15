import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { scanWorkspace } from '@apisentry/analyzer';

describe('Master Acceptance Test Fixture', () => {
  const fixturePath = path.resolve(__dirname, '../../fixtures/request-mismatch');

  it('detects MISSING_REQUEST_FIELD firstName/lastName and UNKNOWN_REQUEST_FIELD fullName', async () => {
    const result = await scanWorkspace(fixturePath);

    const missingFirstName = result.issues.find(
      i => i.type === 'MISSING_REQUEST_FIELD' && i.message.includes('firstName')
    );
    const missingLastName = result.issues.find(
      i => i.type === 'MISSING_REQUEST_FIELD' && i.message.includes('lastName')
    );
    const unknownFullName = result.issues.find(
      i => i.type === 'UNKNOWN_REQUEST_FIELD' && i.message.includes('fullName')
    );

    expect(missingFirstName).toBeDefined();
    expect(missingFirstName?.severity).toBe('error');

    expect(missingLastName).toBeDefined();
    expect(missingLastName?.severity).toBe('error');

    expect(unknownFullName).toBeDefined();
    expect(unknownFullName?.severity).toBe('warning');
  });
});
