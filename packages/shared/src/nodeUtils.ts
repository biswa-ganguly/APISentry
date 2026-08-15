import { Node, SyntaxKind, ObjectLiteralExpression } from 'ts-morph';
import { CodeLocation, ContractField, PrimitiveContractType } from '@apisentry/types';
import { normalizePath, normalizeRoutePattern } from './path.js';

export function getNodeLocation(node: Node): CodeLocation {
  const sourceFile = node.getSourceFile();
  const filePath = normalizePath(sourceFile.getFilePath());
  const start = sourceFile.getLineAndColumnAtPos(node.getStart());
  const end = sourceFile.getLineAndColumnAtPos(node.getEnd());

  return {
    filePath,
    startLine: start.line,
    startColumn: start.column,
    endLine: end.line,
    endColumn: end.column
  };
}

export function evaluateStringLike(node: Node | undefined): string | undefined {
  if (!node) return undefined;

  if (Node.isStringLiteral(node) || Node.isNoSubstitutionTemplateLiteral(node)) {
    return node.getLiteralValue();
  }

  if (Node.isTemplateExpression(node)) {
    let result = node.getHead().getLiteralText();
    for (const span of node.getTemplateSpans()) {
      const expr = span.getExpression();
      const text = expr.getText();
      const cleanVar = text.trim().replace(/^this\./, '').split('.').pop() || 'param';
      result += `:${cleanVar}${span.getLiteral().getLiteralText()}`;
    }
    return normalizeRoutePattern(result);
  }

  if (Node.isIdentifier(node)) {
    const symbol = node.getSymbol();
    if (symbol) {
      const declarations = symbol.getDeclarations();
      if (declarations.length > 0 && Node.isVariableDeclaration(declarations[0])) {
        const initializer = declarations[0].getInitializer();
        if (initializer && initializer !== node) {
          return evaluateStringLike(initializer);
        }
      }
    }
  }

  if (Node.isBinaryExpression(node) && node.getOperatorToken().getKind() === SyntaxKind.PlusToken) {
    const left = evaluateStringLike(node.getLeft());
    const right = evaluateStringLike(node.getRight());
    if (left !== undefined && right !== undefined) {
      return normalizeRoutePattern(`${left}/${right}`);
    }
  }

  return undefined;
}

export function extractContractFieldsFromObjectLiteral(obj: ObjectLiteralExpression): ContractField[] {
  const fields: ContractField[] = [];

  for (const prop of obj.getProperties()) {
    if (Node.isPropertyAssignment(prop)) {
      const name = prop.getName().replace(/['"]/g, '');
      const initializer = prop.getInitializer();
      const typeAndChildren = inferTypeAndChildrenFromNode(initializer);

      fields.push({
        name,
        type: typeAndChildren.type,
        required: true,
        children: typeAndChildren.children,
        location: getNodeLocation(prop)
      });
    } else if (Node.isShorthandPropertyAssignment(prop)) {
      const name = prop.getName();
      fields.push({
        name,
        type: 'unknown',
        required: true,
        location: getNodeLocation(prop)
      });
    }
  }

  return fields;
}

export function inferTypeAndChildrenFromNode(node: Node | undefined): {
  type: PrimitiveContractType;
  children?: ContractField[];
} {
  if (!node) return { type: 'unknown' };

  if (Node.isStringLiteral(node) || Node.isNoSubstitutionTemplateLiteral(node) || Node.isTemplateExpression(node)) {
    return { type: 'string' };
  }
  if (Node.isNumericLiteral(node)) {
    return { type: 'number' };
  }
  if (node.getKind() === SyntaxKind.TrueKeyword || node.getKind() === SyntaxKind.FalseKeyword) {
    return { type: 'boolean' };
  }
  if (Node.isObjectLiteralExpression(node)) {
    return {
      type: 'object',
      children: extractContractFieldsFromObjectLiteral(node)
    };
  }
  if (Node.isArrayLiteralExpression(node)) {
    return { type: 'array' };
  }

  try {
    const type = node.getType();
    if (type.isString() || type.isStringLiteral()) return { type: 'string' };
    if (type.isNumber() || type.isNumberLiteral()) return { type: 'number' };
    if (type.isBoolean() || type.isBooleanLiteral()) return { type: 'boolean' };
    if (type.isArray()) return { type: 'array' };
    if (type.isObject()) return { type: 'object' };
  } catch {
    // Ignore type checking errors on transient nodes
  }

  return { type: 'unknown' };
}
