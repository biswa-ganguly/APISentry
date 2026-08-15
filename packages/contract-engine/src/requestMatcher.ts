import { ApiConsumer, ApiProvider, ContractIssue, ContractField } from '@apisentry/types';
import { resolveSeverity } from './severityResolver.js';
import { ApiSentryConfigValidated } from '@apisentry/config';

export function compareRequestContracts(
  consumer: ApiConsumer,
  provider: ApiProvider,
  config: ApiSentryConfigValidated
): ContractIssue[] {
  const issues: ContractIssue[] = [];

  const consumerFields = consumer.request?.body || [];
  const providerFields = provider.request?.body || [];

  if (providerFields.length === 0 && consumerFields.length === 0) {
    return issues;
  }

  const consumerFieldMap = new Map<string, ContractField>(consumerFields.map(f => [f.name, f]));
  const providerFieldMap = new Map<string, ContractField>(providerFields.map(f => [f.name, f]));

  // Check 1: Provider required fields missing in consumer request
  for (const [name, providerField] of providerFieldMap.entries()) {
    if (providerField.required && !consumerFieldMap.has(name)) {
      issues.push({
        id: `missing-field-${consumer.id}-${name}`,
        type: 'MISSING_REQUEST_FIELD',
        severity: resolveSeverity('MISSING_REQUEST_FIELD', config),
        message: `Backend endpoint "${provider.method} ${provider.path}" requires field "${name}" which is missing in frontend call.`,
        consumer,
        provider,
        primaryLocation: consumer.location,
        relatedLocations: providerField.location ? [providerField.location] : [provider.location]
      });
    }
  }

  // Check 2: Consumer sends unexpected field not accepted/defined by provider
  if (providerFields.length > 0) {
    for (const [name, consumerField] of consumerFieldMap.entries()) {
      if (!providerFieldMap.has(name)) {
        issues.push({
          id: `unknown-field-${consumer.id}-${name}`,
          type: 'UNKNOWN_REQUEST_FIELD',
          severity: resolveSeverity('UNKNOWN_REQUEST_FIELD', config),
          message: `Frontend call sends field "${name}" which is not expected by backend endpoint "${provider.method} ${provider.path}".`,
          consumer,
          provider,
          primaryLocation: consumerField.location || consumer.location,
          relatedLocations: [provider.location]
        });
      }
    }
  }

  // Check 3: Primitive type mismatches
  for (const [name, consumerField] of consumerFieldMap.entries()) {
    const providerField = providerFieldMap.get(name);
    if (providerField && consumerField.type !== 'unknown' && providerField.type !== 'unknown') {
      if (consumerField.type !== providerField.type) {
        issues.push({
          id: `type-mismatch-${consumer.id}-${name}`,
          type: 'REQUEST_TYPE_MISMATCH',
          severity: resolveSeverity('REQUEST_TYPE_MISMATCH', config),
          message: `Type mismatch for field "${name}": frontend sends "${consumerField.type}" but backend expects "${providerField.type}".`,
          consumer,
          provider,
          primaryLocation: consumerField.location || consumer.location,
          relatedLocations: providerField.location ? [providerField.location] : [provider.location]
        });
      }
    }
  }

  return issues;
}
