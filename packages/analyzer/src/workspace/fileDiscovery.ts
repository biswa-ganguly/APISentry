import fg from 'fast-glob';
import path from 'node:path';
import { ApiSentryConfigValidated } from '@apisentry/config';
import { normalizePath } from '@apisentry/shared';

export async function discoverFiles(projectRoot: string, config: ApiSentryConfigValidated): Promise<string[]> {
  const normalizedRoot = normalizePath(projectRoot);

  const files = await fg(config.include, {
    cwd: normalizedRoot,
    ignore: config.exclude,
    absolute: true,
    onlyFiles: true
  });

  return files.map(f => normalizePath(f));
}
