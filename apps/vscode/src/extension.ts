import * as vscode from 'vscode';
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

    // Register tree provider immediately so sidebar view works without delay
    vscode.window.registerTreeDataProvider('apisentry.contractTree', treeProvider);
    outputChannel.appendLine('[APISentry] Registered TreeDataProvider and StatusBar.');

    const runScan = async () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) {
        outputChannel.appendLine('[APISentry] No workspace folder open.');
        return;
      }

      const rootPath = workspaceFolders[0].uri.fsPath;
      outputChannel.appendLine(`[APISentry] Starting workspace scan at ${rootPath}...`);

      try {
        latestResult = await executeWorkspaceScan(rootPath);
        outputChannel.appendLine(`[APISentry] Scan complete: ${latestResult.issues.length} issues found across ${latestResult.metrics.filesDiscovered} files in ${latestResult.metrics.scanDurationMs}ms.`);

        diagnosticManager.updateDiagnostics(latestResult.issues);
        treeProvider.updateResult(latestResult);
        statusBar.updateStatus(latestResult);

        if (ContractPanel.currentPanel) {
          ContractPanel.currentPanel.update(latestResult);
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
      vscode.commands.registerCommand('apisentry.scanWorkspace', runScan),
      vscode.commands.registerCommand('apisentry.refreshContracts', runScan),
      vscode.commands.registerCommand('apisentry.openContractExplorer', () => {
        ContractPanel.createOrShow(context.extensionUri, latestResult);
      }),
      outputChannel,
      diagnosticManager,
      statusBar,
      watcher
    );

    outputChannel.appendLine('[APISentry] Activation complete. Running initial workspace scan...');
    // Run initial scan
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
