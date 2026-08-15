import http from 'node:http';
import url from 'node:url';
import path from 'node:path';
import { exec } from 'node:child_process';
import { scanWorkspace } from '@apisentry/analyzer';
import { getDashboardHtml } from './dashboardHtml.js';

export function startPreviewServer(projectRoot: string, port: number = 4200): void {
  const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url || '/', true);

    if (parsedUrl.pathname === '/' || parsedUrl.pathname === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(getDashboardHtml());
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
