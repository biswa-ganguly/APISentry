import * as vscode from 'vscode';
import { AnalysisResult } from '@apisentry/types';

export class ContractStatusBar {
  private item: vscode.StatusBarItem;

  constructor() {
    // Position on Left Status Bar (priority 100) next to Git branch and diagnostics
    this.item = vscode.window.createStatusBarItem('apisentry.statusBar', vscode.StatusBarAlignment.Left, 100);
    this.item.command = 'apisentry.openContractExplorer';
    this.item.name = 'APISentry API Contract Guard';
    this.updateStatus(null);
    this.item.show();
  }

  updateStatus(result: AnalysisResult | null): void {
    if (!result) {
      this.item.text = '$(shield) APISentry: Ready';
      this.item.tooltip = 'APISentry: Click to scan workspace API contracts';
      this.item.show();
      return;
    }

    const errors = result.issues.filter(i => i.severity === 'error').length;
    const warnings = result.issues.filter(i => i.severity === 'warning').length;

    if (errors > 0) {
      this.item.text = `$(error) APISentry: ${errors} error${errors > 1 ? 's' : ''}`;
      this.item.tooltip = `APISentry detected ${errors} contract errors and ${warnings} warnings. Click to open contract explorer.`;
      this.item.color = new vscode.ThemeColor('statusBarItem.errorBackground');
    } else if (warnings > 0) {
      this.item.text = `$(warning) APISentry: ${warnings} warning${warnings > 1 ? 's' : ''}`;
      this.item.tooltip = `APISentry detected ${warnings} contract warnings. Click to open contract explorer.`;
      this.item.color = new vscode.ThemeColor('statusBarItem.warningBackground');
    } else {
      this.item.text = '$(check) APISentry: Healthy';
      this.item.tooltip = 'APISentry: All API contracts in workspace are verified!';
      this.item.color = undefined;
    }
    this.item.show();
  }

  dispose(): void {
    this.item.dispose();
  }
}
