import * as vscode from 'vscode';

export class WorkspaceWatcher {
  private watcher: vscode.FileSystemWatcher;
  private debounceTimer: NodeJS.Timeout | null = null;

  constructor(private onRescanRequested: () => void) {
    this.watcher = vscode.workspace.createFileSystemWatcher('**/*.{ts,tsx,js,jsx}');

    this.watcher.onDidChange(() => this.triggerDebouncedRescan());
    this.watcher.onDidCreate(() => this.triggerDebouncedRescan());
    this.watcher.onDidDelete(() => this.triggerDebouncedRescan());
  }

  private triggerDebouncedRescan(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.onRescanRequested();
    }, 500);
  }

  dispose(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.watcher.dispose();
  }
}
