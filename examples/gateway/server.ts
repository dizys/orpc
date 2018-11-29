/**
 * ts-node --transpileOnly --project examples/gateway/tsconfig.json examples/gateway/server.ts
 */

import {RPCServer} from '../../bld/library';

import {HelloServicePrototype, IMyRPC} from './shared';

class HelloService implements HelloServicePrototype {
  say(name: string): string {
    return `Hello, ${name}!`;
  }
}

let myRPC: IMyRPC = {
  hello: new HelloService(),
};

async function main(): Promise<void> {
  let server = new RPCServer(myRPC);

  server.start(8015);
}

main().catch(console.error);
