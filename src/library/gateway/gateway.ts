import {RPCClient, createClient} from '../client';
import {SocketIOServer, error, success} from '../server';
import {CallData} from '../shared';

import {GatewayConfig} from './config';
import {evenLoadBalancer} from './load-balancer';
import {Log} from './log';
import {SOAGovernor} from './soa-governor';
import {printWelcome} from './utils';

const REG_EX_SERVICE_NOT_FOUND = /^Service '(.*?)' not found$/;
const REG_EX_METHOD_NOT_FOUND = /^Method '(.*?)' not found$/;

export interface RunningServerInfo {
  url: string;
  client: RPCClient<any>;
  weight: number;
}

export interface DynamicRunningServerInfo {
  url: string;
  weight: number;
  sleepTimeBeforeRevive: number;
}

export class Gateway {
  private log!: Log;

  private serverMap!: Map<string, RunningServerInfo>;

  private dynamicServerMap!: Map<string, DynamicRunningServerInfo>;

  private soa!: SOAGovernor;

  private loadBalanceSequence!: string[];

  /**
   * @internal
   */
  private _sequenceIndex = 0;

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
    this.initializeAOCGovernance();
    this.generateLoadBalanceSequence();
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
      this.dynamicServerMap.set(url, {url, weight, sleepTimeBeforeRevive: 0});

      client.$portal.socketIO.on('connection', () => {
        this.log.info(`Server(${url}) connected.`);

        this.soa.upgradeServer(url);
      });

      client.$portal.socketIO.on('disconnection', () => {
        this.log.info(`Server(${url}) disconnected.`);

        this.soa.downgradeServer(url, 0);
      });
    }
  }

  private initializeAOCGovernance(): void {
    this.soa = new SOAGovernor(
      this.config,
      this.serverMap,
      this.dynamicServerMap,
      () => this.generateLoadBalanceSequence(),
    );
  }

  private generateLoadBalanceSequence(): void {
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

        this.soa.reviveServer();

        let item = this.getNextItemInLoadBalanceSequence();

        if (!item) {
          this.log.debug(
            `Call request(${callUUID}) failed for no available server.`,
          );

          let response = error(callUUID, `No available server`);
          socket.emit('respond', response);
          return;
        }

        let {url, client} = item;

        this.log.debug(
          `Call request(${callUUID}) is being sent to server(${url}).`,
        );

        try {
          let result = await client.$portal.call(service, data);

          let response = success(callUUID, result);
          socket.emit('respond', response);

          this.log.debug(`Call request(${callUUID}) is finished successfully.`);

          this.soa.upgradeServer(url);

          this.log.debug(`Server(${url}) is upgraded due to call success.`);
        } catch (_error) {
          if (
            _error instanceof Error &&
            this.shouldErrorCauseDownGrade(_error)
          ) {
            this.soa.downgradeServer(url);

            this.log.debug(`Server(${url}) is downgraded due to call failure.`);
          }

          let response = error(callUUID, _error);
          socket.emit('respond', response);
        }
      });
    });
  }

  private get sequenceIndex(): number {
    if (
      this._sequenceIndex >= this.loadBalanceSequence.length ||
      this._sequenceIndex < 0
    ) {
      this._sequenceIndex = 0;
    }

    return this._sequenceIndex;
  }

  private moveSequenceIndexToNext(): void {
    this._sequenceIndex++;
  }

  private getNextItemInLoadBalanceSequence(): RunningServerInfo | undefined {
    if (!this.loadBalanceSequence.length) {
      return undefined;
    }

    let url = this.loadBalanceSequence[this.sequenceIndex];

    this.moveSequenceIndexToNext();

    return this.serverMap.get(url);
  }

  private shouldErrorCauseDownGrade(error: Error): boolean {
    if (this.config.downgradeAtAnyError) {
      return true;
    }

    if (
      REG_EX_SERVICE_NOT_FOUND.test(error.message) ||
      REG_EX_METHOD_NOT_FOUND.test(error.message)
    ) {
      return true;
    }

    return false;
  }
}
