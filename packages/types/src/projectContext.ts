import { ApiConsumer } from './apiConsumer.js';
import { ApiProvider } from './apiProvider.js';
import { ContractIssue } from './contractIssue.js';

export interface ApiSentryConfig {
  include?: string[];
  exclude?: string[];
  apiPrefixes?: string[];
  severity?: Record<string, 'error' | 'warning' | 'info'>;
}

export interface ProjectContext {
  rootPath: string;
  config: ApiSentryConfig;
  sourceFiles: string[];
}

export interface AnalysisResult {
  consumers: ApiConsumer[];
  providers: ApiProvider[];
  issues: ContractIssue[];
  metrics: {
    filesDiscovered: number;
    filesParsed: number;
    consumersDetected: number;
    providersDetected: number;
    issuesGenerated: number;
    scanDurationMs: number;
  };
}
