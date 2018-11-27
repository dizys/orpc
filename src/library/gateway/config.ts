export interface ServerInfo {}

export interface LogConfig {
  enable?: boolean;
}

export interface GatewayConfig {
  log: LogConfig;
}

export function createConfigProxy(config: GatewayConfig): GatewayConfig {
  let handler: ProxyHandler<GatewayConfig> = {
    get(_target, _name) {
      return undefined;
    },
  };

  return new Proxy(config, handler);
}
