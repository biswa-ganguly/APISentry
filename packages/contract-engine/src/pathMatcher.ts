import { normalizeRoutePattern } from '@apisentry/shared';

export function matchPaths(consumerPath: string, providerPath: string): boolean {
  const normConsumer = normalizeRoutePattern(consumerPath);
  const normProvider = normalizeRoutePattern(providerPath);

  if (normConsumer === normProvider) return true;

  const consumerSegments = normConsumer.split('/').filter(Boolean);
  const providerSegments = normProvider.split('/').filter(Boolean);

  if (consumerSegments.length !== providerSegments.length) return false;

  for (let i = 0; i < consumerSegments.length; i++) {
    const cSeg = consumerSegments[i];
    const pSeg = providerSegments[i];

    if (cSeg === pSeg) continue;

    // Provider segment is a parameter e.g. :id or :userId
    if (pSeg.startsWith(':')) continue;

    // Consumer segment is a parameter e.g. :id
    if (cSeg.startsWith(':')) continue;

    return false;
  }

  return true;
}
