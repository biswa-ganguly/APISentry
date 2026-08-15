import { SourceFile, Node, Project } from 'ts-morph';
import { ApiProvider, HttpMethod, ContractField } from '@apisentry/types';
import { BackendAdapter } from '../interfaces.js';
import { joinUrlPaths, normalizeRoutePattern, getNodeLocation, evaluateStringLike } from '@apisentry/shared';
import { ZodAdapter } from '../validators/zodAdapter.js';

interface RouterMount {
  mountedVarName: string;
  parentVarName: string;
  prefix: string;
  sourceFilePath: string;
}

export class ExpressAdapter implements BackendAdapter {
  readonly name = 'express';

  async findProviders(project: Project, sourceFiles: SourceFile[]): Promise<ApiProvider[]> {
    const providers: ApiProvider[] = [];

    // Track router mount prefixes
    const routerMounts: RouterMount[] = [];

    for (const file of sourceFiles) {
      file.forEachDescendant(node => {
        if (!Node.isCallExpression(node)) return;

        const expr = node.getExpression();
        if (!Node.isPropertyAccessExpression(expr)) return;

        if (expr.getName() === 'use') {
          const args = node.getArguments();
          if (args.length >= 2) {
            const prefix = evaluateStringLike(args[0]);
            const targetRouter = args[1];
            const parentVarName = expr.getExpression().getText();

            if (prefix && Node.isIdentifier(targetRouter)) {
              const mountedVarName = targetRouter.getText();
              routerMounts.push({
                mountedVarName,
                parentVarName,
                prefix: normalizeRoutePattern(prefix),
                sourceFilePath: file.getFilePath()
              });
            }
          }
        }
      });
    }

    // Resolve nested prefix hierarchy
    const resolvedPrefixes = new Map<string, string>();
    for (const mount of routerMounts) {
      let currentVar = mount.mountedVarName;
      let fullPrefix = '';
      let depth = 0;

      while (depth < 10) {
        depth++;
        const m = routerMounts.find(item => item.mountedVarName === currentVar);
        if (!m) break;

        fullPrefix = fullPrefix ? joinUrlPaths(m.prefix, fullPrefix) : m.prefix;
        currentVar = m.parentVarName;
      }

      resolvedPrefixes.set(mount.mountedVarName, fullPrefix);
    }

    const httpMethods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'];
    const zodAdapter = new ZodAdapter();

    for (const file of sourceFiles) {
      const fileValidators = await zodAdapter.findValidators(file);
      const validatorMap = new Map(fileValidators.map(v => [v.schemaName, v.fields]));

      file.forEachDescendant(node => {
        if (!Node.isCallExpression(node)) return;

        const expr = node.getExpression();
        if (!Node.isPropertyAccessExpression(expr)) return;

        const methodName = expr.getName().toUpperCase() as HttpMethod;
        if (!httpMethods.includes(methodName)) return;

        const callerVarName = expr.getExpression().getText();
        if (['axios', 'window', 'globalThis', 'fetch'].includes(callerVarName)) return;

        const args = node.getArguments();
        if (args.length < 2) return;

        const rawPath = evaluateStringLike(args[0]);
        if (rawPath === undefined) return;

        const routePrefix = resolvedPrefixes.get(callerVarName) || '';
        const fullPath = routePrefix ? joinUrlPaths(routePrefix, rawPath) : normalizeRoutePattern(rawPath);
        const location = getNodeLocation(node);

        const bodyFields: ContractField[] = [];
        const responseFields: ContractField[] = [];

        for (let i = 1; i < args.length; i++) {
          const arg = args[i];

          const argText = arg.getText();
          for (const [schemaName, fields] of validatorMap.entries()) {
            if (argText.includes(schemaName)) {
              bodyFields.push(...fields);
            }
          }

          if (Node.isArrowFunction(arg) || Node.isFunctionExpression(arg)) {
            const body = arg.getBody();
            if (body) {
              body.forEachDescendant(subNode => {
                if (Node.isVariableDeclaration(subNode)) {
                  const init = subNode.getInitializer();
                  if (init && (init.getText() === 'req.body' || init.getText() === 'request.body')) {
                    const nameNode = subNode.getNameNode();
                    if (Node.isObjectBindingPattern(nameNode)) {
                      for (const element of nameNode.getElements()) {
                        const fieldName = element.getName();
                        if (!bodyFields.some(f => f.name === fieldName)) {
                          bodyFields.push({
                            name: fieldName,
                            type: 'unknown',
                            required: true,
                            location: getNodeLocation(element)
                          });
                        }
                      }
                    }
                  }
                }

                if (Node.isPropertyAccessExpression(subNode)) {
                  const subExpr = subNode.getExpression();
                  if (subExpr.getText() === 'req.body' || subExpr.getText() === 'request.body') {
                    const propName = subNode.getName();
                    if (!bodyFields.some(f => f.name === propName)) {
                      bodyFields.push({
                        name: propName,
                        type: 'unknown',
                        required: true,
                        location: getNodeLocation(subNode)
                      });
                    }
                  }
                }

                if (Node.isCallExpression(subNode)) {
                  const callExpr = subNode.getExpression();
                  let isResJson = false;

                  if (Node.isPropertyAccessExpression(callExpr) && callExpr.getName() === 'json') {
                    const innerCaller = callExpr.getExpression();
                    if (innerCaller.getText() === 'res' || innerCaller.getText() === 'response') {
                      isResJson = true;
                    } else if (Node.isCallExpression(innerCaller)) {
                      const innerExpr = innerCaller.getExpression();
                      if (Node.isPropertyAccessExpression(innerExpr) && innerExpr.getName() === 'status') {
                        isResJson = true;
                      }
                    }
                  }

                  if (isResJson) {
                    const jsonArgs = subNode.getArguments();
                    if (jsonArgs.length > 0 && Node.isObjectLiteralExpression(jsonArgs[0])) {
                      for (const p of jsonArgs[0].getProperties()) {
                        if (Node.isPropertyAssignment(p)) {
                          responseFields.push({
                            name: p.getName().replace(/['"]/g, ''),
                            type: 'unknown',
                            required: true,
                            location: getNodeLocation(p)
                          });
                        }
                      }
                    }
                  }
                }
              });
            }
          }
        }

        providers.push({
          id: `express-${providers.length + 1}-${location.startLine}`,
          method: methodName,
          path: fullPath,
          request: bodyFields.length > 0 ? { body: bodyFields } : undefined,
          responses: responseFields.length > 0 ? [{ statusCode: 200, fields: responseFields }] : undefined,
          location,
          source: { adapter: this.name }
        });
      });
    }

    return providers;
  }
}
