import { ApiProvider, HttpMethod } from '@apisentry/types';
import { normalizePath } from '@apisentry/shared';

export class DjangoAdapter {
  readonly name = 'Django';

  canHandleContent(content: string): boolean {
    return (
      content.includes('urlpatterns') ||
      content.includes('django.urls') ||
      /path\s*\(\s*["'][^"']+["']/.test(content)
    );
  }

  parseFile(filePath: string, content: string): ApiProvider[] {
    const providers: ApiProvider[] = [];
    const normalizedFilePath = normalizePath(filePath);

    const pathRegex = /path\s*\(\s*(["'])([^"']*)\1/g;
    let match: RegExpExecArray | null;

    const lines = content.split('\n');

    while ((match = pathRegex.exec(content)) !== null) {
      const rawPath = match[2];
      const normalizedPath = this.normalizeDjangoPath(rawPath);

      const charIndex = match.index;
      let lineNumber = 1;
      let currentOffset = 0;
      for (let i = 0; i < lines.length; i++) {
        currentOffset += lines[i].length + 1;
        if (currentOffset > charIndex) {
          lineNumber = i + 1;
          break;
        }
      }

      const defaultMethods: HttpMethod[] = ['GET', 'POST'];
      for (const method of defaultMethods) {
        providers.push({
          id: `django-${method}-${normalizedPath}-${lineNumber}`,
          method,
          path: normalizedPath,
          source: { adapter: 'django' },
          location: {
            filePath: normalizedFilePath,
            startLine: lineNumber,
            startColumn: 1,
            endLine: lineNumber,
            endColumn: match[0].length + 1
          }
        });
      }
    }

    return providers;
  }

  private normalizeDjangoPath(rawPath: string): string {
    let p = rawPath.trim();
    if (!p.startsWith('/')) {
      p = '/' + p;
    }
    if (p.endsWith('/') && p.length > 1) {
      p = p.slice(0, -1);
    }
    p = p.replace(/<(?:\w+:)?([a-zA-Z0-9_]+)>/g, ':$1');
    return p;
  }
}
