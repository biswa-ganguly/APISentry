import { ApiProvider, ContractField, HttpMethod, PrimitiveContractType } from '@apisentry/types';
import { normalizePath } from '@apisentry/shared';

export class FastApiAdapter {
  readonly name = 'FastAPI';

  canHandleContent(content: string): boolean {
    return (
      content.includes('FastAPI') ||
      content.includes('APIRouter') ||
      /@(app|router)\.(get|post|put|delete|patch)\b/.test(content)
    );
  }

  parseFile(filePath: string, content: string): ApiProvider[] {
    const providers: ApiProvider[] = [];
    const normalizedFilePath = normalizePath(filePath);

    const pydanticSchemas = this.extractPydanticSchemas(content);

    const routeRegex = /@(app|router)\.(get|post|put|delete|patch)\s*\(\s*(["'])([^"']+)\3/g;
    let match: RegExpExecArray | null;

    const lines = content.split('\n');

    while ((match = routeRegex.exec(content)) !== null) {
      const method = match[2].toUpperCase() as HttpMethod;
      const rawPath = match[4];
      const normalizedPath = this.normalizeFastApiPath(rawPath);

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

      const remainingContent = content.slice(charIndex);
      const fnMatch = remainingContent.match(/def\s+\w+\s*\(([^)]*)\)/);
      const requestFields: ContractField[] = [];

      if (fnMatch && fnMatch[1]) {
        const params = fnMatch[1].split(',');
        for (const param of params) {
          const parts = param.split(':').map(s => s.trim());
          if (parts.length === 2) {
            const paramName = parts[0];
            const rawType = parts[1].split('=')[0].trim();

            if (pydanticSchemas.has(rawType)) {
              requestFields.push(...(pydanticSchemas.get(rawType) || []));
            } else if (paramTypeToContract(rawType) && paramName !== 'request' && paramName !== 'response') {
              requestFields.push({
                name: paramName,
                type: paramTypeToContract(rawType),
                required: !param.includes('=')
              });
            }
          }
        }
      }

      providers.push({
        id: `fastapi-${method}-${normalizedPath}-${lineNumber}`,
        method,
        path: normalizedPath,
        source: { adapter: 'fastapi' },
        location: {
          filePath: normalizedFilePath,
          startLine: lineNumber,
          startColumn: 1,
          endLine: lineNumber,
          endColumn: match[0].length + 1
        },
        request: requestFields.length > 0 ? { body: requestFields } : undefined
      });
    }

    return providers;
  }

  private normalizeFastApiPath(rawPath: string): string {
    let p = rawPath.trim();
    if (!p.startsWith('/')) {
      p = '/' + p;
    }
    p = p.replace(/\{([a-zA-Z0-9_]+)\}/g, ':$1');
    return p;
  }

  private extractPydanticSchemas(content: string): Map<string, ContractField[]> {
    const schemas = new Map<string, ContractField[]>();

    const classRegex = /class\s+([A-Za-z0-9_]+)\s*\(\s*(?:BaseModel|Schema)\s*\):([\s\S]*?)(?=\nclass\s+|\ndef\s+|\n\n\n|$)/g;
    let match: RegExpExecArray | null;

    while ((match = classRegex.exec(content)) !== null) {
      const className = match[1];
      const classBody = match[2];
      const fields: ContractField[] = [];

      const lineRegex = /^\s*([a-zA-Z0-9_]+)\s*:\s*([^=\n#]+)(?:=\s*([^#\n]+))?/gm;
      let fieldMatch: RegExpExecArray | null;

      while ((fieldMatch = lineRegex.exec(classBody)) !== null) {
        const fieldName = fieldMatch[1];
        if (fieldName === 'pass' || fieldName === 'doc') continue;
        const rawType = fieldMatch[2].trim();
        const defaultValue = fieldMatch[3]?.trim();

        fields.push({
          name: fieldName,
          type: paramTypeToContract(rawType),
          required: defaultValue === undefined || defaultValue === '...'
        });
      }

      schemas.set(className, fields);
    }

    return schemas;
  }
}

function paramTypeToContract(pythonType: string): PrimitiveContractType {
  const lower = pythonType.toLowerCase();
  if (lower.includes('str')) return 'string';
  if (lower.includes('int') || lower.includes('float')) return 'number';
  if (lower.includes('bool')) return 'boolean';
  if (lower.includes('dict')) return 'object';
  if (lower.includes('list')) return 'array';
  return 'unknown';
}
