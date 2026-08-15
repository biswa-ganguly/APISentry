import fs from 'node:fs';
import path from 'node:path';

export function getDashboardHtml(logoBase64?: string): string {
  let html = '';
  let css = '';

  try {
    const htmlPath = path.resolve(__dirname, 'dashboard.html');
    const cssPath = path.resolve(__dirname, 'styles.css');

    if (fs.existsSync(htmlPath)) {
      html = fs.readFileSync(htmlPath, 'utf-8');
    }
    if (fs.existsSync(cssPath)) {
      css = fs.readFileSync(cssPath, 'utf-8');
    }
  } catch {
    // Fallback
  }

  const logoHtml = logoBase64
    ? `<img src="${logoBase64}" class="logo-img" alt="APISentry">`
    : `<div class="logo-img" style="background:linear-gradient(135deg, #06B6D4, #6366F1); display:flex; align-items:center; justify-content:center; font-weight:bold; color:white;">AS</div>`;

  if (html) {
    return html
      .replace('/* STYLES_INJECT_PLACEHOLDER */', css)
      .replace('<!-- LOGO_INJECT_PLACEHOLDER -->', logoHtml);
  }

  // Fallback
  return `<!DOCTYPE html><html><body><h1>APISentry Live Preview</h1></body></html>`;
}
