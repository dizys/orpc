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
  let server1 = new RPCServer(myRPC);

  server1.start(8015);

  let server2 = new RPCServer(myRPC);

  server2.start(8016);

  let server3 = new RPCServer(myRPC);

  server3.start(8017);
}

main().catch(console.error);
