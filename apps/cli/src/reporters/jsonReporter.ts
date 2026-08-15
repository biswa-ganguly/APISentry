import { AnalysisResult } from '@apisentry/types';

export function renderJsonReport(result: AnalysisResult): string {
  return JSON.stringify(result, null, 2);
}
