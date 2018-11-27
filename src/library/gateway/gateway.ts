import {RPCClient, createClient} from '../client';
import {SocketIOServer, error} from '../server';
import {CallData} from '../shared';

import {GatewayConfig} from './config';
import {evenLoadBalancer} from './load-balancer';
import {Log} from './log';
import {printWelcome} from './utils';

const REGX_SERVICE_NOT_FOUND = /^Service '(.*?)' not found$/;
const REGX_METHOD_NOT_FOUND = /^Method '(.*?)' not found$/;

export interface RunningServerInfo {
  url: string;
  client: RPCClient<any>;
  weight: number;
}

export interface DynamicRunningServerInfo {
  url: string;
  weight: number;
}

export class Gateway {
  private log!: Log;

  private serverMap!: Map<string, RunningServerInfo>;

  private dynamicServerMap!: Map<string, DynamicRunningServerInfo>;

  private loadBalanceSequence!: string[];

  private _sequence_index = 0;

  private socketIO!: SocketIOServer;

  constructor(private config: GatewayConfig) {
    printWelcome();

    this.initialize();

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

  reloadConfig(config: GatewayConfig): void {
    this.config = config;
    this.initialize();
  }

  private initialize(): void {
    this.initializeLog();
    this.initializeClients();
    this.initializeLoadBalanceSequence();
    this.initializeSocketIO();
  }

  private initializeLog(): void {
    this.log = new Log(this.config.log);
  }

  private initializeClients(): void {
    this.serverMap = new Map<string, RunningServerInfo>();
    this.dynamicServerMap = new Map<string, DynamicRunningServerInfo>();

    for (let server of this.config.servers) {
      let {url, weight = 1} = server;

      let client = createClient(url);

      this.serverMap.set(url, {url, client, weight});
      this.dynamicServerMap.set(url, {url, weight});
    }
  }

  private initializeLoadBalanceSequence(): void {
    let servers = Array.from(this.dynamicServerMap.values());
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

      socket.on('call', async (service: string, data: CallData) => {
        let {callUUID} = data;

        let item = this.getNextItemInLoadBalanceSequence();

        if (!item) {
          let response = error(callUUID, `No available server`);
          socket.emit('respond', response);
          return;
        }

        let {url, client} = item;

        try {
          await client.$portal.call(service, data);
        } catch (_error) {
          if (
            _error instanceof Error &&
            this.shouldErrorCauseDownGrade(_error)
          ) {
            this.downgradeServer(url);
          }

          let response = error(callUUID, _error);
          socket.emit('respond', response);
        }
      });
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

  private shouldErrorCauseDownGrade(error: Error): boolean {
    if (this.config.downgradeAtAnyError) {
      return true;
    }

    if (
      REGX_SERVICE_NOT_FOUND.test(error.message) ||
      REGX_METHOD_NOT_FOUND.test(error.message)
    ) {
      return true;
    }

    return false;
  }

  private downgradeServer(url: string): void {}
}
