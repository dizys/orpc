import {LoadBalancer} from './load-balancer';

export interface ServerInfo {}

export interface LogConfig {
  enable?: boolean;
  debug?: boolean;
}

export interface ServerInfo {
  url: string;
  weight?: number;
}

export interface GatewayConfig {
  servers: ServerInfo[];
  loadBalancer?: LoadBalancer;
  log?: LogConfig;
}
