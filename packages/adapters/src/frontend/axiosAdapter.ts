import { SourceFile, Node } from 'ts-morph';
import { ApiConsumer, HttpMethod, ContractField } from '@apisentry/types';
import { FrontendAdapter } from '../interfaces.js';
import { joinUrlPaths, normalizeRoutePattern, getNodeLocation, evaluateStringLike, extractContractFieldsFromObjectLiteral } from '@apisentry/shared';

export class AxiosAdapter implements FrontendAdapter {
  readonly name = 'axios';

  canHandleFile(filePath: string): boolean {
    return /\.(js|jsx|ts|tsx)$/.test(filePath);
  }

  async findConsumers(sourceFile: SourceFile): Promise<ApiConsumer[]> {
    const consumers: ApiConsumer[] = [];

    const instanceBaseUrls = new Map<string, string>();
    sourceFile.forEachDescendant(node => {
      if (Node.isCallExpression(node)) {
        const expression = node.getExpression();
        if (Node.isPropertyAccessExpression(expression) && expression.getName() === 'create') {
          const obj = expression.getExpression();
          if (Node.isIdentifier(obj) && obj.getText() === 'axios') {
            const args = node.getArguments();
            if (args.length > 0 && Node.isObjectLiteralExpression(args[0])) {
              const baseURLProp = args[0].getProperty('baseURL');
              if (baseURLProp && Node.isPropertyAssignment(baseURLProp)) {
                const val = evaluateStringLike(baseURLProp.getInitializer());
                if (val) {
                  const parent = node.getParent();
                  if (Node.isVariableDeclaration(parent)) {
                    instanceBaseUrls.set(parent.getName(), val);
                  }
                }
              }
            }
          }
        }
      }
    });

    const httpMethods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'];

    sourceFile.forEachDescendant(node => {
      if (!Node.isCallExpression(node)) return;

      const expr = node.getExpression();
      if (!Node.isPropertyAccessExpression(expr)) return;

      const methodName = expr.getName().toUpperCase() as HttpMethod;
      if (!httpMethods.includes(methodName)) return;

      const callerObj = expr.getExpression();
      const callerText = callerObj.getText();

      let isAxiosCall = callerText === 'axios';
      let baseUrl = '';

      if (!isAxiosCall && instanceBaseUrls.has(callerText)) {
        isAxiosCall = true;
        baseUrl = instanceBaseUrls.get(callerText)!;
      }

      if (!isAxiosCall) return;

      const args = node.getArguments();
      if (args.length === 0) return;

      const rawPath = evaluateStringLike(args[0]);
      if (!rawPath) return;

      const fullPath = baseUrl ? joinUrlPaths(baseUrl, rawPath) : normalizeRoutePattern(rawPath);
      const location = getNodeLocation(node);

      let bodyFields: ContractField[] | undefined = undefined;
      const responseFields: ContractField[] = [];

      if (['POST', 'PUT', 'PATCH'].includes(methodName) && args.length >= 2) {
        const bodyArg = args[1];
        if (Node.isObjectLiteralExpression(bodyArg)) {
          bodyFields = extractContractFieldsFromObjectLiteral(bodyArg);
        } else if (Node.isIdentifier(bodyArg)) {
          const symbol = bodyArg.getSymbol();
          if (symbol) {
            const decls = symbol.getDeclarations();
            if (decls.length > 0 && Node.isVariableDeclaration(decls[0])) {
              const init = decls[0].getInitializer();
              if (init && Node.isObjectLiteralExpression(init)) {
                bodyFields = extractContractFieldsFromObjectLiteral(init);
              }
            }
          }
        }
      }

      // Check if call result is assigned to variable to trace response property accesses e.g. res.data.email
      let parent = node.getParent();
      if (Node.isAwaitExpression(parent)) {
        parent = parent.getParent();
      }
      if (Node.isVariableDeclaration(parent)) {
        const varName = parent.getName();
        
        // Search container source file for property accesses on varName.data.<field>
        sourceFile.forEachDescendant(sub => {
          if (Node.isPropertyAccessExpression(sub)) {
            const subExpr = sub.getExpression();
            if (Node.isPropertyAccessExpression(subExpr)) {
              if (subExpr.getExpression().getText() === varName && subExpr.getName() === 'data') {
                const propName = sub.getName();
                if (!responseFields.some(f => f.name === propName)) {
                  responseFields.push({
                    name: propName,
                    type: 'unknown',
                    required: true,
                    location: getNodeLocation(sub)
                  });
                }
              }
            }
          }
        });
      }

      consumers.push({
        id: `axios-${consumers.length + 1}-${location.startLine}`,
        method: methodName,
        path: fullPath,
        request: bodyFields ? { body: bodyFields } : undefined,
        expectedResponse: responseFields.length > 0 ? { fields: responseFields } : undefined,
        location,
        source: { adapter: this.name }
      });
    });

    return consumers;
  }
}
