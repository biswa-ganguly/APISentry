import { ContractIssueType, IssueSeverity } from '@apisentry/types';
import { ApiSentryConfigValidated } from '@apisentry/config';

export function resolveSeverity(issueType: ContractIssueType, config: ApiSentryConfigValidated): IssueSeverity {
  const configured = config.severity[issueType];
  if (configured) return configured;

  switch (issueType) {
    case 'ENDPOINT_NOT_FOUND':
    case 'METHOD_MISMATCH':
    case 'MISSING_PATH_PARAMETER':
    case 'MISSING_REQUEST_FIELD':
    case 'REQUEST_TYPE_MISMATCH':
      return 'error';
    case 'UNKNOWN_REQUEST_FIELD':
    case 'RESPONSE_FIELD_MISSING':
      return 'warning';
    case 'DYNAMIC_ENDPOINT_UNRESOLVED':
      return 'info';
    default:
      return 'warning';
  }
}
