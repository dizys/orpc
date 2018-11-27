import {GatewayConfig, createConfigProxy} from './config';

export class Gateway {
  private config: GatewayConfig;

  constructor(config: GatewayConfig) {
    this.config = createConfigProxy(config);

    console.log(this.config.log.enable);
  }
}
