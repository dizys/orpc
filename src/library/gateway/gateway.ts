import {RPCClient} from '../client';

import {GatewayConfig} from './config';
import {Log} from './log';
import {ProxyServer} from './proxy';
import {printWelcome} from './utils';

export class Gateway {
  private log: Log;

  private serverMap = new Map<string, RPCClient<any>>();

  private proxyServer = new ProxyServer();

  constructor(private config: GatewayConfig) {
    this.log = new Log(this.config.log);

    printWelcome();

    this.log.info('Gateway initialized.');
  }

  start(port?: number, hostname?: string): void {
    this.proxyServer.start(port, hostname);
  }
}
