import { SourceFile, Project } from 'ts-morph';
import { ApiConsumer, ApiProvider, ContractField } from '@apisentry/types';

export interface FrontendAdapter {
  readonly name: string;
  canHandleFile(filePath: string): boolean;
  findConsumers(sourceFile: SourceFile): Promise<ApiConsumer[]>;
}

export interface BackendAdapter {
  readonly name: string;
  findProviders(project: Project, sourceFiles: SourceFile[]): Promise<ApiProvider[]>;
}

export interface SchemaValidationResult {
  schemaName: string;
  fields: ContractField[];
}

export interface ValidatorAdapter {
  readonly name: string;
  findValidators(sourceFile: SourceFile): Promise<SchemaValidationResult[]>;
}
