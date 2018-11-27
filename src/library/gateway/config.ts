export interface ServerInfo {}

export interface LogConfig {
  enable?: boolean;
}

export interface ServerInfo {
  url: string;
  weight?: number;
}

export interface GatewayConfig {
  servers: ServerInfo[];
  log?: LogConfig;
}
