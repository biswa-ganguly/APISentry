import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Dashboard } from '@apisentry/ui';
import { AnalysisResult } from '@apisentry/types';

const WebApp: React.FC = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [logoBase64, setLogoBase64] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const fetchScan = async (preset: string = '') => {
    setIsScanning(true);
    try {
      const url = preset ? `/api/scan-fixture?fixture=${encodeURIComponent(preset)}` : '/api/scan';
      const res = await fetch(url);
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error('Failed to fetch scan:', err);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    // Fetch initial logo and scan
    fetch('/api/logo')
      .then(res => res.json())
      .then(data => { if (data.logoBase64) setLogoBase64(data.logoBase64); })
      .catch(() => {});

    fetchScan('');
  }, []);

  const handleScan = () => {
    fetchScan(selectedPreset);
  };

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    fetchScan(preset);
  };

  return (
    <Dashboard
      result={result}
      logoBase64={logoBase64}
      selectedPreset={selectedPreset}
      onPresetChange={handlePresetChange}
      onScan={handleScan}
      isScanning={isScanning}
    />
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<WebApp />);
}
