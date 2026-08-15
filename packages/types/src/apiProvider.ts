import { CodeLocation } from './codeLocation.js';
import { ContractField, HttpMethod } from './apiContract.js';

export interface ApiResponseDefinition {
  statusCode?: number;
  fields?: ContractField[];
}

export interface ApiProvider {
  id: string;
  method: HttpMethod;
  path: string;
  request?: {
    params?: ContractField[];
    query?: ContractField[];
    body?: ContractField[];
  };
  responses?: ApiResponseDefinition[];
  location: CodeLocation;
  source: {
    adapter: 'express' | string;
  };
}
