import {
  RPCClient,
  RPCSchema,
  RPCServer,
  createClient as _createClient,
} from '../bld/library';

export async function createServer(schemaImpl: any): Promise<RPCServer> {
  let server = new RPCServer(schemaImpl);

  server.start(8013);

  return server;
}

export function createClient<Schema extends RPCSchema>(): RPCClient<Schema> {
  return _createClient<Schema>('http://localhost:8013/');
}
