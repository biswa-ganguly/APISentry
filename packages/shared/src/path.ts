import path from 'node:path';

export function normalizePath(p: string): string {
  return p.replace(/\\/g, '/');
}

export function joinUrlPaths(...segments: string[]): string {
  const cleanSegments = segments
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => s.replace(/^\/+|\/+$/g, ''));
  
  const joined = cleanSegments.join('/');
  return joined ? `/${joined}` : '/';
}

export function normalizeRoutePattern(routePath: string): string {
  if (!routePath) return '/';
  
  // Ensure leading slash
  let normalized = routePath.startsWith('/') ? routePath : `/${routePath}`;
  
  // Replace template variable expressions or inline variables with :param format
  // e.g. /users/${userId} -> /users/:userId
  normalized = normalized.replace(/\$\{([^}]+)\}/g, (_, varName) => {
    const cleanVar = varName.trim().replace(/^this\./, '').split('.').pop() || 'param';
    return `:${cleanVar}`;
  });

  // Remove trailing slashes (except root)
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}
