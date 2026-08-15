import fs from 'node:fs';
import path from 'node:path';
import { ApiSentryConfig } from '@apisentry/types';
import { DEFAULT_CONFIG_FILENAMES } from '@apisentry/shared';
import { ApiSentryConfigSchema, ApiSentryConfigValidated } from './schema.js';

export function loadConfig(projectRoot: string): ApiSentryConfigValidated {
  let fileConfig: Record<string, unknown> = {};

  for (const filename of DEFAULT_CONFIG_FILENAMES) {
    const configPath = path.join(projectRoot, filename);
    if (fs.existsSync(configPath)) {
      try {
        const content = fs.readFileSync(configPath, 'utf-8');
        fileConfig = JSON.parse(content);
        break;
      } catch (err) {
        console.warn(`[APISentry] Warning: Failed to parse configuration file at ${configPath}:`, err);
      }
    }
  }

  const result = ApiSentryConfigSchema.safeParse(fileConfig);
  if (!result.success) {
    console.warn('[APISentry] Invalid config parameters found, applying defaults:', result.error.format());
    return ApiSentryConfigSchema.parse({});
  }

  return result.data;
}
