import { CodeLocation } from './codeLocation.js';
import { ApiConsumer } from './apiConsumer.js';
import { ApiProvider } from './apiProvider.js';

export type ContractIssueType =
  | 'ENDPOINT_NOT_FOUND'
  | 'METHOD_MISMATCH'
  | 'MISSING_PATH_PARAMETER'
  | 'MISSING_REQUEST_FIELD'
  | 'UNKNOWN_REQUEST_FIELD'
  | 'REQUEST_TYPE_MISMATCH'
  | 'RESPONSE_FIELD_MISSING'
  | 'DYNAMIC_ENDPOINT_UNRESOLVED';

export type IssueSeverity = 'error' | 'warning' | 'info';

export interface ContractIssue {
  id: string;
  type: ContractIssueType;
  severity: IssueSeverity;
  message: string;
  consumer?: ApiConsumer;
  provider?: ApiProvider;
  primaryLocation: CodeLocation;
  relatedLocations?: CodeLocation[];
  metadata?: Record<string, unknown>;
}
