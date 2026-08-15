import { AnalysisResult, ApiConsumer, ApiProvider } from '@apisentry/types';
import { loadConfig } from '@apisentry/config';
import { AxiosAdapter, FetchAdapter, ExpressAdapter } from '@apisentry/adapters';
import { ContractEngine } from '@apisentry/contract-engine';
import { discoverFiles } from './fileDiscovery.js';
import { createProject } from './projectLoader.js';

export async function scanWorkspace(projectRoot: string): Promise<AnalysisResult> {
  const startTime = Date.now();
  const config = loadConfig(projectRoot);

  const filePaths = await discoverFiles(projectRoot, config);
  const project = createProject(filePaths);

  const sourceFiles = project.getSourceFiles();

  const consumers: ApiConsumer[] = [];
  const providers: ApiProvider[] = [];

  const axiosAdapter = new AxiosAdapter();
  const fetchAdapter = new FetchAdapter();
  const expressAdapter = new ExpressAdapter();

  for (const sf of sourceFiles) {
    if (axiosAdapter.canHandleFile(sf.getFilePath())) {
      const axiosConsumers = await axiosAdapter.findConsumers(sf);
      consumers.push(...axiosConsumers);
    }
    if (fetchAdapter.canHandleFile(sf.getFilePath())) {
      const fetchConsumers = await fetchAdapter.findConsumers(sf);
      consumers.push(...fetchConsumers);
    }
  }

  const expressProviders = await expressAdapter.findProviders(project, sourceFiles);
  providers.push(...expressProviders);

  const engine = new ContractEngine(config);
  const issues = engine.match(consumers, providers);

  const duration = Date.now() - startTime;

  return {
    consumers,
    providers,
    issues,
    metrics: {
      filesDiscovered: filePaths.length,
      filesParsed: sourceFiles.length,
      consumersDetected: consumers.length,
      providersDetected: providers.length,
      issuesGenerated: issues.length,
      scanDurationMs: duration
    }
  };
}
