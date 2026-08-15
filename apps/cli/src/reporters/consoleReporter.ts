import { AnalysisResult } from '@apisentry/types';

export function renderConsoleReport(result: AnalysisResult): void {
  console.log('\n==========================================');
  console.log('         APISentry Analysis Report        ');
  console.log('==========================================\n');

  console.log(`Files discovered:  ${result.metrics.filesDiscovered}`);
  console.log(`Frontend calls:    ${result.metrics.consumersDetected}`);
  console.log(`Backend routes:    ${result.metrics.providersDetected}`);
  console.log(`Scan duration:     ${result.metrics.scanDurationMs} ms\n`);

  const errors = result.issues.filter(i => i.severity === 'error');
  const warnings = result.issues.filter(i => i.severity === 'warning');
  const infos = result.issues.filter(i => i.severity === 'info');

  console.log(`Issues summary: ${errors.length} errors, ${warnings.length} warnings, ${infos.length} info\n`);

  if (result.issues.length === 0) {
    console.log('✓ All API contracts are healthy!\n');
    return;
  }

  for (const issue of result.issues) {
    const icon = issue.severity === 'error' ? '✖ [ERROR]' : issue.severity === 'warning' ? '⚠ [WARNING]' : 'ℹ [INFO]';
    console.log(`${icon} ${issue.type}`);
    console.log(`  Message:  ${issue.message}`);
    console.log(`  Location: ${issue.primaryLocation.filePath}:${issue.primaryLocation.startLine}:${issue.primaryLocation.startColumn}`);
    if (issue.relatedLocations && issue.relatedLocations.length > 0) {
      for (const rel of issue.relatedLocations) {
        console.log(`  Related:  ${rel.filePath}:${rel.startLine}:${rel.startColumn}`);
      }
    }
    console.log('');
  }
}
