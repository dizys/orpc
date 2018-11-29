import {GatewayConfig} from './config';
import {DynamicRunningServerInfo, RunningServerInfo} from './gateway';

type Callback = (...args: any[]) => any;

export class SOAGovernor {
  constructor(
    private config: GatewayConfig,
    private serverMap: Map<string, RunningServerInfo>,
    private dynamicServerMap: Map<string, DynamicRunningServerInfo>,
    private weightAdjustCallback: Callback,
  ) {}

  downgradeServer(url: string, toWeight?: number): void {
    this.adjustServerWeight(url, 'down', toWeight);
  }

  upgradeServer(url: string, toWeight?: number): void {
    this.adjustServerWeight(url, 'up', toWeight);
  }

  reviveServer(): void {
    if (this.config.downgrade === false) {
      return;
    }

    // Default downgradeDeadSleepTime
    let timeLimit = this.config.downgradeDeadSleepTime || 5;

    let servers = Array.from(this.dynamicServerMap.values());

    for (let server of servers) {
      if (server.weight === 0) {
        server.sleepTimeBeforeRevive++;

        if (server.sleepTimeBeforeRevive > timeLimit) {
          this.upgradeServer(server.url);

          server.sleepTimeBeforeRevive -= 2;
        }
      }
    }
  }

  private adjustServerWeight(
    url: string,
    tend: 'down' | 'up' = 'down',
    toWeight?: number,
  ): void {
    if (this.config.downgrade === false) {
      return;
    }

    let serverOrigin = this.serverMap.get(url);
    let server = this.dynamicServerMap.get(url);

    if (!serverOrigin || !server || serverOrigin.weight === server.weight) {
      return;
    }

    if (typeof toWeight === 'number') {
      server.weight = toWeight;
    } else {
      // Default downgradeTolerantTime
      let stepCount = this.config.downgradeTolerantTime || 3;

      let step = Math.ceil(serverOrigin.weight / stepCount);

      if (tend === 'down') {
        server.weight -= step;
      } else {
        server.weight += step;
      }

      if (server.weight < 0) {
        server.weight = 0;
      } else if (server.weight > serverOrigin.weight) {
        server.weight = serverOrigin.weight;
      }
    }

    this.weightAdjustCallback();
  }
}
