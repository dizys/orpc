import {LogConfig} from './config';

type LogType = 'info' | 'debug' | 'error';

export class Log {
  constructor(private config?: LogConfig) {}

  get enabled(): boolean {
    return !this.config || this.config.enable === true;
  }

  log(type: LogType, ...args: any[]): void {
    if (this.enabled) {
      console[type]('[gateway]', ...args);
    }
  }

  info(...args: any[]): void {
    this.log('info', '[info]', ...args);
  }

  debug(...args: any[]): void {
    this.log('debug', '[debug]', ...args);
  }

  error(...args: any[]): void {
    this.log('error', '[error]', ...args);
  }
}
