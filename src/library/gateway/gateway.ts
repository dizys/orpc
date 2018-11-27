import {RPCClient, createClient} from '../client';
import {SocketIOServer} from '../server';
import {CallData} from '../shared';

import {GatewayConfig} from './config';
import {evenLoadBalancer} from './load-balancer';
import {Log} from './log';
import {printWelcome} from './utils';

export interface RunningServerInfo {
  url: string;
  client: RPCClient<any>;
  weight: number;
}

export class Gateway {
  private log: Log;

  private serverMap!: Map<string, RunningServerInfo>;

  private loadBalanceSequence!: string[];

  private _sequence_index = 0;

  private socketIO!: SocketIOServer;

  constructor(private config: GatewayConfig) {
    this.log = new Log(this.config.log);

    printWelcome();

    this.initializeClients();
    this.initializeLoadBalanceSequence();
    this.initializeSocketIO();

    this.log.info('Gateway initialized.');
  }

  start(port?: number, hostname?: string): void {
    this.socketIO.start(port, hostname);
    this.log.info(`Gateway server start listening at ${port}...`);
  }

  stop(): void {
    this.socketIO.stop();
    this.log.info(`Gateway server stopped.`);
  }

  reloadConfig(_config: GatewayConfig): void {}

  private initializeClients() {
    this.serverMap = new Map<string, RunningServerInfo>();

    for (let server of this.config.servers) {
      let {url, weight = 1} = server;

      let client = createClient(url);

      this.serverMap.set(url, {url, client, weight});
    }
  }

  private initializeLoadBalanceSequence(): void {
    let servers = Array.from(this.serverMap.values());
    let loadBalancer = this.config.loadBalancer;

    if (!loadBalancer) {
      // Default load balancer
      this.loadBalanceSequence = evenLoadBalancer(servers);
      return;
    }

    this.loadBalanceSequence = loadBalancer(servers);
  }

  private initializeSocketIO(): void {
    this.socketIO = new SocketIOServer();

    this.socketIO.on('connection', socket => {
      this.log.debug(`Client(${socket.id}) connected.`);

      socket.on('call', (service: string, data: CallData) => {});
    });
  }

  private get sequenceIndex(): number {
    if (
      this._sequence_index >= this.loadBalanceSequence.length &&
      this._sequence_index < 0
    ) {
      this._sequence_index = 0;
    }

    return this._sequence_index;
  }

  private getNextItemInLoadBalanceSequence(): RunningServerInfo | undefined {
    if (!this.loadBalanceSequence.length) {
      return undefined;
    }

    let url = this.loadBalanceSequence[this.sequenceIndex];
    return this.serverMap.get(url);
  }
}
