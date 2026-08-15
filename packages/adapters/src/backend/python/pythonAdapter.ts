import fs from 'node:fs';
import { ApiProvider } from '@apisentry/types';
import { FastApiAdapter } from './fastApiAdapter.js';
import { FlaskAdapter } from './flaskAdapter.js';
import { DjangoAdapter } from './djangoAdapter.js';

export class PythonAdapter {
  readonly name = 'PythonBackend';
  private fastApiAdapter = new FastApiAdapter();
  private flaskAdapter = new FlaskAdapter();
  private djangoAdapter = new DjangoAdapter();

  canHandleFile(filePath: string): boolean {
    return filePath.endsWith('.py');
  }

  async findProvidersForFile(filePath: string): Promise<ApiProvider[]> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const providers: ApiProvider[] = [];

      if (this.fastApiAdapter.canHandleContent(content)) {
        providers.push(...this.fastApiAdapter.parseFile(filePath, content));
      }
      if (this.flaskAdapter.canHandleContent(content)) {
        providers.push(...this.flaskAdapter.parseFile(filePath, content));
      }
      if (this.djangoAdapter.canHandleContent(content)) {
        providers.push(...this.djangoAdapter.parseFile(filePath, content));
      }

      return providers;
    } catch (err) {
      console.warn(`[APISentry] Failed to parse Python backend file: ${filePath}`, err);
      return [];
    }
  }

  async findProviders(pythonFilePaths: string[]): Promise<ApiProvider[]> {
    const allProviders: ApiProvider[] = [];

    for (const filePath of pythonFilePaths) {
      if (this.canHandleFile(filePath)) {
        const fileProviders = await this.findProvidersForFile(filePath);
        allProviders.push(...fileProviders);
      }
    }

    return allProviders;
  }
}
