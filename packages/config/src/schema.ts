import { z } from 'zod';
import { DEFAULT_EXCLUDES, DEFAULT_INCLUDES } from '@apisentry/shared';

export const ApiSentryConfigSchema = z.object({
  include: z.array(z.string()).default(DEFAULT_INCLUDES),
  exclude: z.array(z.string()).default(DEFAULT_EXCLUDES),
  apiPrefixes: z.array(z.string()).default([]),
  severity: z.record(z.enum(['error', 'warning', 'info'])).default({
    ENDPOINT_NOT_FOUND: 'error',
    METHOD_MISMATCH: 'error',
    MISSING_PATH_PARAMETER: 'error',
    MISSING_REQUEST_FIELD: 'error',
    REQUEST_TYPE_MISMATCH: 'error',
    UNKNOWN_REQUEST_FIELD: 'warning',
    RESPONSE_FIELD_MISSING: 'warning',
    DYNAMIC_ENDPOINT_UNRESOLVED: 'info'
  })
});

export type ApiSentryConfigValidated = z.infer<typeof ApiSentryConfigSchema>;
