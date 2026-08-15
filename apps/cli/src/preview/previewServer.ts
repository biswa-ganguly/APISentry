import http from 'node:http';
import url from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import { exec } from 'node:child_process';
import { scanWorkspace } from '@apisentry/analyzer';

let logoBase64 = '';
try {
  const iconPath = path.resolve(__dirname, '../../../vscode/icon.png');
  if (fs.existsSync(iconPath)) {
    logoBase64 = `data:image/png;base64,${fs.readFileSync(iconPath).toString('base64')}`;
  }
} catch {}

export function startPreviewServer(projectRoot: string, port: number = 4200): void {
  const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url || '/', true);

    if (parsedUrl.pathname === '/' || parsedUrl.pathname === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>APISentry - Instant API Contract Preview</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Montserrat', 'system-ui', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
          }
        }
      }
    }
  </script>
</head>
<body class="bg-[#0B0F17] text-[#F3F4F6] font-sans min-h-screen antialiased bg-[radial-gradient(at_10%_10%,rgba(99,102,241,0.15)_0px,transparent_50%),radial-gradient(at_90%_90%,rgba(6,182,212,0.15)_0px,transparent_50%)]">
  <div id="root"></div>
  <script src="/bundle.js"></script>
</body>
</html>`);
      return;
    }

    if (parsedUrl.pathname === '/bundle.js') {
      const bundlePath = path.resolve(__dirname, 'bundle.js');
      if (fs.existsSync(bundlePath)) {
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(fs.readFileSync(bundlePath));
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Bundle not found');
      }
      return;
    }

    if (parsedUrl.pathname === '/api/logo') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ logoBase64 }));
      return;
    }

    if (parsedUrl.pathname === '/api/scan') {
      try {
        const result = await scanWorkspace(projectRoot);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: String(err) }));
      }
      return;
    }

    if (parsedUrl.pathname === '/api/scan-fixture') {
      try {
        const fixtureRel = parsedUrl.query.fixture as string;
        const targetPath = fixtureRel ? path.resolve(projectRoot, fixtureRel) : projectRoot;
        const result = await scanWorkspace(targetPath);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: String(err) }));
      }
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[APISentry] Port ${port} is in use, trying port ${port + 1}...`);
      startPreviewServer(projectRoot, port + 1);
    } else {
      console.error('[APISentry] Server error:', err);
    }
  });

  server.listen(port, () => {
    const previewUrl = `http://localhost:${port}`;
    console.log(`\n==========================================`);
    console.log(`🚀 APISentry Live Preview Server Started!`);
    console.log(`==========================================`);
    console.log(`\n  Dashboard URL: ${previewUrl}`);
    console.log(`  Press Ctrl+C to stop server.\n`);

    // Auto open browser
    const startCmd = process.platform === 'darwin' ? `open ${previewUrl}` : process.platform === 'win32' ? `start ${previewUrl}` : `xdg-open ${previewUrl}`;
    exec(startCmd, () => {});
  });
}
