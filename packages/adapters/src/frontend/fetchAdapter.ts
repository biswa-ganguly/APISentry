import { SourceFile, Node } from 'ts-morph';
import { ApiConsumer, HttpMethod, ContractField } from '@apisentry/types';
import { FrontendAdapter } from '../interfaces.js';
import { normalizeRoutePattern, getNodeLocation, evaluateStringLike, extractContractFieldsFromObjectLiteral } from '@apisentry/shared';

export class FetchAdapter implements FrontendAdapter {
  readonly name = 'fetch';

  canHandleFile(filePath: string): boolean {
    return /\.(js|jsx|ts|tsx)$/.test(filePath);
  }

  async findConsumers(sourceFile: SourceFile): Promise<ApiConsumer[]> {
    const consumers: ApiConsumer[] = [];

    sourceFile.forEachDescendant(node => {
      if (!Node.isCallExpression(node)) return;

      const expr = node.getExpression();
      if (!Node.isIdentifier(expr) || expr.getText() !== 'fetch') return;

      const args = node.getArguments();
      if (args.length === 0) return;

      const rawPath = evaluateStringLike(args[0]);
      if (!rawPath) return;

      const fullPath = normalizeRoutePattern(rawPath);
      const location = getNodeLocation(node);

      let method: HttpMethod = 'GET';
      let bodyFields: ContractField[] | undefined = undefined;

      if (args.length >= 2 && Node.isObjectLiteralExpression(args[1])) {
        const optionsObj = args[1];

        // Extract method property
        const methodProp = optionsObj.getProperty('method');
        if (methodProp && Node.isPropertyAssignment(methodProp)) {
          const val = evaluateStringLike(methodProp.getInitializer());
          if (val) {
            method = val.toUpperCase() as HttpMethod;
          }
        }

        // Extract body property if e.g. body: JSON.stringify({ ... })
        const bodyProp = optionsObj.getProperty('body');
        if (bodyProp && Node.isPropertyAssignment(bodyProp)) {
          const init = bodyProp.getInitializer();
          if (Node.isCallExpression(init)) {
            const callExpr = init.getExpression();
            if (Node.isPropertyAccessExpression(callExpr) && callExpr.getText() === 'JSON.stringify') {
              const stringifyArgs = init.getArguments();
              if (stringifyArgs.length > 0) {
                const arg = stringifyArgs[0];
                if (Node.isObjectLiteralExpression(arg)) {
                  bodyFields = extractContractFieldsFromObjectLiteral(arg);
                } else if (Node.isIdentifier(arg)) {
                  const symbol = arg.getSymbol();
                  if (symbol) {
                    const decls = symbol.getDeclarations();
                    if (decls.length > 0 && Node.isVariableDeclaration(decls[0])) {
                      const declInit = decls[0].getInitializer();
                      if (declInit && Node.isObjectLiteralExpression(declInit)) {
                        bodyFields = extractContractFieldsFromObjectLiteral(declInit);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      consumers.push({
        id: `fetch-${consumers.length + 1}-${location.startLine}`,
        method,
        path: fullPath,
        request: bodyFields ? { body: bodyFields } : undefined,
        location,
        source: { adapter: this.name }
      });
    });

    return consumers;
  }
}
