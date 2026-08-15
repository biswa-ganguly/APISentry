import * as vscode from 'vscode';
import { ContractIssue, CodeLocation } from '@apisentry/types';

export class DiagnosticManager {
  private collection: vscode.DiagnosticCollection;

  constructor() {
    this.collection = vscode.languages.createDiagnosticCollection('apisentry');
  }

  updateDiagnostics(issues: ContractIssue[]): void {
    this.collection.clear();

    const issuesByFile = new Map<string, vscode.Diagnostic[]>();

    for (const issue of issues) {
      const loc = issue.primaryLocation;
      const uri = vscode.Uri.file(loc.filePath);

      const range = new vscode.Range(
        Math.max(0, loc.startLine - 1),
        Math.max(0, loc.startColumn - 1),
        Math.max(0, (loc.endLine || loc.startLine) - 1),
        Math.max(0, (loc.endColumn || loc.startColumn + 10) - 1)
      );

      const severity = issue.severity === 'error'
        ? vscode.DiagnosticSeverity.Error
        : issue.severity === 'warning'
        ? vscode.DiagnosticSeverity.Warning
        : vscode.DiagnosticSeverity.Information;

      const diagnostic = new vscode.Diagnostic(range, issue.message, severity);
      diagnostic.source = 'APISentry';
      diagnostic.code = issue.type;

      if (issue.relatedLocations && issue.relatedLocations.length > 0) {
        diagnostic.relatedInformation = issue.relatedLocations.map(rel => {
          const relUri = vscode.Uri.file(rel.filePath);
          const relRange = new vscode.Range(
            Math.max(0, rel.startLine - 1),
            Math.max(0, rel.startColumn - 1),
            Math.max(0, (rel.endLine || rel.startLine) - 1),
            Math.max(0, (rel.endColumn || rel.startColumn + 10) - 1)
          );
          return new vscode.DiagnosticRelatedInformation(
            new vscode.Location(relUri, relRange),
            'Backend provider definition'
          );
        });
      }

      const existing = issuesByFile.get(uri.fsPath) || [];
      existing.push(diagnostic);
      issuesByFile.set(uri.fsPath, existing);
    }

    for (const [filePath, diagnostics] of issuesByFile.entries()) {
      this.collection.set(vscode.Uri.file(filePath), diagnostics);
    }
  }

  dispose(): void {
    this.collection.dispose();
  }
}
