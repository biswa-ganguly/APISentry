import { exec } from 'node:child_process';
import path from 'node:path';
import { AnalysisResult } from '@apisentry/types';

export async function executeWorkspaceScan(rootPath: string): Promise<AnalysisResult> {
  // Try dynamic import of @apisentry/analyzer first
  try {
    const analyzer = await import('@apisentry/analyzer');
    if (analyzer && typeof analyzer.scanWorkspace === 'function') {
      return await analyzer.scanWorkspace(rootPath);
    }
  } catch {
    // Dynamic import fallback to Node process scanner
  }

  return new Promise((resolve, reject) => {
    const cliPath = path.resolve(__dirname, '../../../cli/dist/index.js');
    const cmd = `node "${cliPath}" scan --path "${rootPath}" --format json`;

    exec(cmd, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error && !stdout) {
        return reject(error);
      }
      try {
        const result: AnalysisResult = JSON.parse(stdout);
        resolve(result);
      } catch (parseErr) {
        reject(new Error(`Failed to parse scan output: ${parseErr}`));
      }
    });
  });
}
