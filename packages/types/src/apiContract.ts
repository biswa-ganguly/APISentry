import { CodeLocation } from './codeLocation.js';

export type PrimitiveContractType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'unknown';

export interface ContractField {
  name: string;
  type: PrimitiveContractType;
  required: boolean;
  nullable?: boolean;
  children?: ContractField[];
  location?: CodeLocation;
}

export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'OPTIONS'
  | 'HEAD';
