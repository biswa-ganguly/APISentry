import { CodeLocation } from './codeLocation.js';
import { ContractField, HttpMethod } from './apiContract.js';

export interface ApiConsumer {
  id: string;
  method: HttpMethod;
  path: string;
  request?: {
    params?: ContractField[];
    query?: ContractField[];
    body?: ContractField[];
  };
  expectedResponse?: {
    fields?: ContractField[];
  };
  location: CodeLocation;
  source: {
    adapter: 'axios' | 'fetch' | string;
  };
}
