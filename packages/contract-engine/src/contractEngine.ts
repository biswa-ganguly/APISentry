import { ApiConsumer, ApiProvider, ContractIssue } from '@apisentry/types';
import { ApiSentryConfigValidated } from '@apisentry/config';
import { matchPaths } from './pathMatcher.js';
import { compareRequestContracts } from './requestMatcher.js';
import { compareResponseContracts } from './responseMatcher.js';
import { resolveSeverity } from './severityResolver.js';

export class ContractEngine {
  constructor(private config: ApiSentryConfigValidated) {}

  match(consumers: ApiConsumer[], providers: ApiProvider[]): ContractIssue[] {
    const issues: ContractIssue[] = [];

    for (const consumer of consumers) {
      // 1. Find providers with matching path structure
      const matchingPathProviders = providers.filter(p => matchPaths(consumer.path, p.path));

      if (matchingPathProviders.length === 0) {
        issues.push({
          id: `endpoint-not-found-${consumer.id}`,
          type: 'ENDPOINT_NOT_FOUND',
          severity: resolveSeverity('ENDPOINT_NOT_FOUND', this.config),
          message: `Backend endpoint "${consumer.method} ${consumer.path}" was not found on backend.`,
          consumer,
          primaryLocation: consumer.location
        });
        continue;
      }

      // 2. Check HTTP method matching
      const exactMatchProvider = matchingPathProviders.find(p => p.method === consumer.method);

      if (!exactMatchProvider) {
        const availableMethods = matchingPathProviders.map(p => p.method).join(', ');
        issues.push({
          id: `method-mismatch-${consumer.id}`,
          type: 'METHOD_MISMATCH',
          severity: resolveSeverity('METHOD_MISMATCH', this.config),
          message: `Method mismatch for "${consumer.path}". Frontend uses "${consumer.method}" but backend accepts "${availableMethods}".`,
          consumer,
          provider: matchingPathProviders[0],
          primaryLocation: consumer.location,
          relatedLocations: [matchingPathProviders[0].location]
        });
        continue;
      }

      // 3. Compare request contracts
      const requestIssues = compareRequestContracts(consumer, exactMatchProvider, this.config);
      issues.push(...requestIssues);

      // 4. Compare response contracts
      const responseIssues = compareResponseContracts(consumer, exactMatchProvider, this.config);
      issues.push(...responseIssues);
    }

    return issues;
  }
}
