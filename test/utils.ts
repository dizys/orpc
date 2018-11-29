import {
  Gateway,
  GatewayConfig,
  RPCClient,
  RPCSchema,
  RPCServer,
  createClient as _createClient,
} from '../bld/library';

export async function createServer(
  schemaImpl: any,
  port: number = 8013,
): Promise<RPCServer> {
  let server = new RPCServer(schemaImpl);

  server.start(port);

  return server;
}

export function createClient<Schema extends RPCSchema>(
  port: number = 8013,
): RPCClient<Schema> {
  return _createClient<Schema>(`http://localhost:${port}/`);
}

export function createGateway(
  config: GatewayConfig = {
    servers: [{url: 'http://localhost:8015/', weight: 1}],
    log: {debug: true},
  },
  port: number = 8014,
): Gateway {
  let gateway = new Gateway(config);

  gateway.start(port);

  return gateway;
}
