import { ApiConsumer, ApiProvider, ContractIssue } from '@apisentry/types';
import { resolveSeverity } from './severityResolver.js';
import { ApiSentryConfigValidated } from '@apisentry/config';

export function compareResponseContracts(
  consumer: ApiConsumer,
  provider: ApiProvider,
  config: ApiSentryConfigValidated
): ContractIssue[] {
  const issues: ContractIssue[] = [];

  const expectedResponseFields = consumer.expectedResponse?.fields || [];
  if (expectedResponseFields.length === 0) return issues;

  const providerResponses = provider.responses || [];
  if (providerResponses.length === 0) return issues;

  const providerFields = providerResponses[0].fields || [];
  const providerFieldNames = new Set(providerFields.map(f => f.name));

  for (const expField of expectedResponseFields) {
    if (!providerFieldNames.has(expField.name)) {
      issues.push({
        id: `response-field-missing-${consumer.id}-${expField.name}`,
        type: 'RESPONSE_FIELD_MISSING',
        severity: resolveSeverity('RESPONSE_FIELD_MISSING', config),
        message: `Property "${expField.name}" was not detected in backend API response contract.`,
        consumer,
        provider,
        primaryLocation: expField.location || consumer.location,
        relatedLocations: [provider.location]
      });
    }
  }

  return issues;
}
