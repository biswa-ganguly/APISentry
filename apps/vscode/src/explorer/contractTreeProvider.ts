import * as vscode from 'vscode';
import { AnalysisResult, ApiConsumer, ContractIssue } from '@apisentry/types';

export class ContractTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly status: 'broken' | 'warning' | 'valid' | 'category',
    public readonly consumer?: ApiConsumer,
    public readonly issue?: ContractIssue
  ) {
    super(label, collapsibleState);

    if (status === 'category') {
      this.contextValue = 'category';
      if (label.startsWith('Broken')) {
        this.iconPath = new vscode.ThemeIcon('error', new vscode.ThemeColor('testing.iconFailed'));
      } else if (label.startsWith('Warnings')) {
        this.iconPath = new vscode.ThemeIcon('warning', new vscode.ThemeColor('testing.iconQueued'));
      } else {
        this.iconPath = new vscode.ThemeIcon('check', new vscode.ThemeColor('testing.iconPassed'));
      }
    } else {
      this.contextValue = 'endpoint';
      if (status === 'broken') {
        this.iconPath = new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('testing.iconFailed'));
      } else if (status === 'warning') {
        this.iconPath = new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('testing.iconQueued'));
      } else {
        this.iconPath = new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('testing.iconPassed'));
      }

      if (consumer) {
        this.command = {
          command: 'vscode.open',
          title: 'Open File',
          arguments: [
            vscode.Uri.file(consumer.location.filePath),
            {
              selection: new vscode.Range(
                Math.max(0, consumer.location.startLine - 1),
                Math.max(0, consumer.location.startColumn - 1),
                Math.max(0, consumer.location.startLine - 1),
                Math.max(0, consumer.location.startColumn + 10)
              )
            }
          ]
        };
      }
    }
  }
}

export class ContractTreeProvider implements vscode.TreeDataProvider<ContractTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<ContractTreeItem | undefined | null | void> =
    new vscode.EventEmitter<ContractTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<ContractTreeItem | undefined | null | void> =
    this._onDidChangeTreeData.event;

  private result: AnalysisResult | null = null;

  updateResult(result: AnalysisResult): void {
    this.result = result;
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ContractTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: ContractTreeItem): Promise<ContractTreeItem[]> {
    if (!this.result) return Promise.resolve([]);

    if (!element) {
      const brokenIssues = this.result.issues.filter(i => i.severity === 'error');
      const warningIssues = this.result.issues.filter(i => i.severity === 'warning');

      const brokenConsumerIds = new Set(brokenIssues.map(i => i.consumer?.id).filter(Boolean));
      const warningConsumerIds = new Set(warningIssues.map(i => i.consumer?.id).filter(Boolean));

      const validConsumers = this.result.consumers.filter(
        c => !brokenConsumerIds.has(c.id) && !warningConsumerIds.has(c.id)
      );

      return Promise.resolve([
        new ContractTreeItem(`Broken (${brokenIssues.length})`, vscode.TreeItemCollapsibleState.Expanded, 'category'),
        new ContractTreeItem(`Warnings (${warningIssues.length})`, vscode.TreeItemCollapsibleState.Expanded, 'category'),
        new ContractTreeItem(`Valid (${validConsumers.length})`, vscode.TreeItemCollapsibleState.Collapsed, 'category')
      ]);
    }

    if (element.label.startsWith('Broken')) {
      const brokenIssues = this.result.issues.filter(i => i.severity === 'error');
      return Promise.resolve(
        brokenIssues.map(
          i => new ContractTreeItem(
            `${i.consumer?.method || ''} ${i.consumer?.path || ''} - ${i.message}`,
            vscode.TreeItemCollapsibleState.None,
            'broken',
            i.consumer,
            i
          )
        )
      );
    }

    if (element.label.startsWith('Warnings')) {
      const warningIssues = this.result.issues.filter(i => i.severity === 'warning');
      return Promise.resolve(
        warningIssues.map(
          i => new ContractTreeItem(
            `${i.consumer?.method || ''} ${i.consumer?.path || ''} - ${i.message}`,
            vscode.TreeItemCollapsibleState.None,
            'warning',
            i.consumer,
            i
          )
        )
      );
    }

    if (element.label.startsWith('Valid')) {
      const brokenIssues = this.result.issues.filter(i => i.severity === 'error');
      const warningIssues = this.result.issues.filter(i => i.severity === 'warning');
      const brokenConsumerIds = new Set(brokenIssues.map(i => i.consumer?.id).filter(Boolean));
      const warningConsumerIds = new Set(warningIssues.map(i => i.consumer?.id).filter(Boolean));

      const validConsumers = this.result.consumers.filter(
        c => !brokenConsumerIds.has(c.id) && !warningConsumerIds.has(c.id)
      );

      return Promise.resolve(
        validConsumers.map(
          c => new ContractTreeItem(
            `${c.method} ${c.path}`,
            vscode.TreeItemCollapsibleState.None,
            'valid',
            c
          )
        )
      );
    }

    return Promise.resolve([]);
  }
}
