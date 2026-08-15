import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Dashboard } from '@apisentry/ui';
import { AnalysisResult } from '@apisentry/types';

declare function acquireVsCodeApi(): {
  postMessage: (msg: any) => void;
  getState: () => any;
  setState: (state: any) => void;
};

const vscode = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : null;

const App: React.FC = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [logoBase64, setLogoBase64] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === 'UPDATE_DATA') {
        setResult(message.result);
        if (message.logoBase64) setLogoBase64(message.logoBase64);
        if (message.selectedPreset !== undefined) setSelectedPreset(message.selectedPreset);
        setIsScanning(false);
      } else if (message.type === 'SCAN_START') {
        setIsScanning(true);
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Request initial data from VS Code host
    if (vscode) {
      vscode.postMessage({ command: 'ready' });
    }

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleScan = () => {
    setIsScanning(true);
    if (vscode) {
      vscode.postMessage({ command: 'scanWorkspace', fixture: selectedPreset });
    }
  };

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    setIsScanning(true);
    if (vscode) {
      vscode.postMessage({ command: 'scanWorkspace', fixture: preset });
    }
  };

  const handleOpenFile = (filePath: string, line: number, column: number) => {
    if (vscode) {
      vscode.postMessage({ command: 'openFile', filePath, line, column });
    }
  };

  return (
    <Dashboard
      result={result}
      logoBase64={logoBase64}
      selectedPreset={selectedPreset}
      onPresetChange={handlePresetChange}
      onScan={handleScan}
      isScanning={isScanning}
      onOpenFile={handleOpenFile}
    />
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<App />);
}
