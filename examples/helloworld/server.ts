/**
 * ts-node --transpileOnly --project examples/helloworld/tsconfig.json examples/helloworld/server.ts
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

  server.start(8013);
}

main().catch(console.error);
