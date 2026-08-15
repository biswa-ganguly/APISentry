import fs from 'node:fs';
import path from 'node:path';

export function getDashboardHtml(logoBase64?: string): string {
  let html = '';

  try {
    const htmlPath = path.resolve(__dirname, 'dashboard.html');
    if (fs.existsSync(htmlPath)) {
      html = fs.readFileSync(htmlPath, 'utf-8');
    }
  } catch {
    // Fallback
  }

  const logoHtml = logoBase64
    ? `<img src="${logoBase64}" class="w-11 h-11 rounded-xl shadow-[0_0_16px_rgba(6,182,212,0.5)] object-cover" alt="APISentry">`
    : `<div class="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center font-extrabold text-white text-lg shadow-[0_0_16px_rgba(6,182,212,0.5)]">AS</div>`;

  if (html) {
    return html.replace('<!-- LOGO_INJECT_PLACEHOLDER -->', logoHtml);
  }

  return `<!DOCTYPE html><html><body><h1>APISentry Live Preview</h1></body></html>`;
}
