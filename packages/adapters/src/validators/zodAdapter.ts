import { SourceFile, Node } from 'ts-morph';
import { ContractField, PrimitiveContractType } from '@apisentry/types';
import { SchemaValidationResult, ValidatorAdapter } from '../interfaces.js';
import { getNodeLocation } from '@apisentry/shared';

export class ZodAdapter implements ValidatorAdapter {
  readonly name = 'zod';

  async findValidators(sourceFile: SourceFile): Promise<SchemaValidationResult[]> {
    const results: SchemaValidationResult[] = [];

    sourceFile.forEachDescendant(node => {
      if (!Node.isVariableDeclaration(node)) return;

      const name = node.getName();
      const initializer = node.getInitializer();
      if (!initializer) return;

      if (Node.isCallExpression(initializer)) {
        const fields = this.extractFieldsFromZodExpression(initializer);
        if (fields.length > 0) {
          results.push({
            schemaName: name,
            fields
          });
        }
      }
    });

    return results;
  }

  private extractFieldsFromZodExpression(node: Node): ContractField[] {
    // Check if it's z.object({ ... })
    if (Node.isCallExpression(node)) {
      const expr = node.getExpression();
      if (Node.isPropertyAccessExpression(expr) && expr.getName() === 'object') {
        const caller = expr.getExpression();
        if (caller.getText() === 'z' || caller.getText() === 'Zod' || caller.getText().endsWith('.z')) {
          const args = node.getArguments();
          if (args.length > 0 && Node.isObjectLiteralExpression(args[0])) {
            return this.extractFieldsFromObjectLiteral(args[0]);
          }
        }
      }
    }
    return [];
  }

  private extractFieldsFromObjectLiteral(obj: import('ts-morph').ObjectLiteralExpression): ContractField[] {
    const fields: ContractField[] = [];

    for (const prop of obj.getProperties()) {
      if (Node.isPropertyAssignment(prop)) {
        const fieldName = prop.getName().replace(/['"]/g, '');
        const valNode = prop.getInitializer();

        const { type, required } = this.parseZodChain(valNode);

        fields.push({
          name: fieldName,
          type,
          required,
          location: getNodeLocation(prop)
        });
      }
    }

    return fields;
  }

  private parseZodChain(node: Node | undefined): { type: PrimitiveContractType; required: boolean } {
    if (!node) return { type: 'unknown', required: true };
    let current: Node | undefined = node;
    let required = true;
    let type: PrimitiveContractType = 'unknown';

    // Traverse method chains e.g. z.string().email().optional()
    while (current) {
      if (Node.isCallExpression(current)) {
        const expr = current.getExpression();
        if (Node.isPropertyAccessExpression(expr)) {
          const method = expr.getName();
          if (method === 'optional') {
            required = false;
          } else if (method === 'nullable') {
            required = false;
          } else if (method === 'string') {
            type = 'string';
          } else if (method === 'number') {
            type = 'number';
          } else if (method === 'boolean') {
            type = 'boolean';
          } else if (method === 'array') {
            type = 'array';
          } else if (method === 'object') {
            type = 'object';
          }
          current = expr.getExpression();
          continue;
        }
      }

      if (Node.isPropertyAccessExpression(current)) {
        const propName = current.getName();
        if (propName === 'string') type = 'string';
        if (propName === 'number') type = 'number';
        if (propName === 'boolean') type = 'boolean';
      }

      break;
    }

    return { type, required };
  }
}
