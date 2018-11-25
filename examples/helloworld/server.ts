import {RPCServer} from '../../bld/library';

import {HelloServicePrototype, MyRPCSchema} from './shared';

class HelloService implements HelloServicePrototype {
  say(name: string): string {
    return `Hello, ${name}!`;
  }
}

let rpcSchema: MyRPCSchema = {
  hello: new HelloService(),
};

async function main(): Promise<void> {
  let server = new RPCServer(rpcSchema);

  server.start(8013);
}

main().catch(console.error);
