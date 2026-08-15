export interface Logger {
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
  debug(message: string, ...args: unknown[]): void;
}

export class ConsoleLogger implements Logger {
  constructor(private debugEnabled: boolean = false) {}

  info(message: string, ...args: unknown[]): void {
    console.log(`[APISentry] ${message}`, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(`[APISentry WARN] ${message}`, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    console.error(`[APISentry ERROR] ${message}`, ...args);
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.debugEnabled) {
      console.debug(`[APISentry DEBUG] ${message}`, ...args);
    }
  }
}

export class NoopLogger implements Logger {
  info(): void {}
  warn(): void {}
  error(): void {}
  debug(): void {}
}
