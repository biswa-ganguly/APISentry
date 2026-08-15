import { ApiProvider, HttpMethod } from '@apisentry/types';
import { normalizePath } from '@apisentry/shared';

export class FlaskAdapter {
  readonly name = 'Flask';

  canHandleContent(content: string): boolean {
    return (
      content.includes('Flask') ||
      content.includes('Blueprint') ||
      /@(app|bp|blueprint)\.route\b/.test(content)
    );
  }

  parseFile(filePath: string, content: string): ApiProvider[] {
    const providers: ApiProvider[] = [];
    const normalizedFilePath = normalizePath(filePath);

    const routeRegex = /@(app|bp|blueprint)\.route\s*\(\s*(["'])([^"']+)\2(?:[^)]*methods\s*=\s*\[([^\]]+)\])?/g;
    let match: RegExpExecArray | null;

    const lines = content.split('\n');

    while ((match = routeRegex.exec(content)) !== null) {
      const rawPath = match[3];
      const normalizedPath = this.normalizeFlaskPath(rawPath);
      const methodsRaw = match[4];

      let methods: HttpMethod[] = ['GET'];
      if (methodsRaw) {
        methods = methodsRaw
          .replace(/["'\s]/g, '')
          .split(',')
          .filter(Boolean)
          .map(m => m.toUpperCase() as HttpMethod);
      }

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

      for (const method of methods) {
        providers.push({
          id: `flask-${method}-${normalizedPath}-${lineNumber}`,
          method,
          path: normalizedPath,
          source: { adapter: 'flask' },
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

  private normalizeFlaskPath(rawPath: string): string {
    let p = rawPath.trim();
    if (!p.startsWith('/')) {
      p = '/' + p;
    }
    p = p.replace(/<(?:\w+:)?([a-zA-Z0-9_]+)>/g, ':$1');
    return p;
  }
}
