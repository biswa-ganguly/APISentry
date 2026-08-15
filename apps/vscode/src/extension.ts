import * as vscode from 'vscode';
import path from 'node:path';
import { AnalysisResult } from '@apisentry/types';
import { DiagnosticManager } from './diagnostics/diagnosticManager.js';
import { ContractTreeProvider } from './explorer/contractTreeProvider.js';
import { ContractStatusBar } from './statusbar/contractStatusBar.js';
import { WorkspaceWatcher } from './watchers/workspaceWatcher.js';
import { ContractPanel } from './webview/contractPanel.js';
import { executeWorkspaceScan } from './services/scanService.js';

let diagnosticManager: DiagnosticManager;
let treeProvider: ContractTreeProvider;
let statusBar: ContractStatusBar;
let watcher: WorkspaceWatcher;
let outputChannel: vscode.OutputChannel;
let latestResult: AnalysisResult | null = null;

export async function activate(context: vscode.ExtensionContext) {
  try {
    outputChannel = vscode.window.createOutputChannel('APISentry');
    outputChannel.appendLine('[APISentry] Extension activating...');

    diagnosticManager = new DiagnosticManager();
    treeProvider = new ContractTreeProvider();
    statusBar = new ContractStatusBar();

    vscode.window.registerTreeDataProvider('apisentry.contractTree', treeProvider);
    outputChannel.appendLine('[APISentry] Registered TreeDataProvider and StatusBar.');

    const runScan = async (presetPath?: string) => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      let rootPath = workspaceFolders && workspaceFolders.length > 0 ? workspaceFolders[0].uri.fsPath : process.cwd();

      if (presetPath && typeof presetPath === 'string') {
        rootPath = path.isAbsolute(presetPath) ? presetPath : path.resolve(rootPath, presetPath);
      }

      outputChannel.appendLine(`[APISentry] Starting workspace scan at ${rootPath}...`);

      try {
        latestResult = await executeWorkspaceScan(rootPath);
        outputChannel.appendLine(`[APISentry] Scan complete: ${latestResult.issues.length} issues found across ${latestResult.metrics.filesDiscovered} files in ${latestResult.metrics.scanDurationMs}ms.`);

        diagnosticManager.updateDiagnostics(latestResult.issues);
        treeProvider.updateResult(latestResult);
        statusBar.updateStatus(latestResult);

        if (ContractPanel.currentPanel) {
          ContractPanel.currentPanel.update(latestResult, presetPath || '');
        }
      } catch (err) {
        outputChannel.appendLine(`[APISentry ERROR] Workspace scan failed: ${err}`);
      }
    };

    watcher = new WorkspaceWatcher(() => {
      outputChannel.appendLine('[APISentry] File change detected, running scan...');
      runScan();
    });

    context.subscriptions.push(
      vscode.commands.registerCommand('apisentry.scanWorkspace', (presetPath?: string) => runScan(presetPath)),
      vscode.commands.registerCommand('apisentry.refreshContracts', () => runScan()),
      vscode.commands.registerCommand('apisentry.openContractExplorer', () => {
        ContractPanel.createOrShow(context.extensionUri, latestResult);
      }),
      outputChannel,
      diagnosticManager,
      statusBar,
      watcher
    );

    outputChannel.appendLine('[APISentry] Activation complete. Running initial workspace scan...');
    runScan();
  } catch (activationErr) {
    console.error('[APISentry FATAL] Activation failed:', activationErr);
  }
}

export function deactivate() {
  if (diagnosticManager) diagnosticManager.dispose();
  if (statusBar) statusBar.dispose();
  if (watcher) watcher.dispose();
}
