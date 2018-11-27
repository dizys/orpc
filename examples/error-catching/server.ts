/**
 * ts-node --transpileOnly --project examples/error-catching/tsconfig.json examples/error-catching/server.ts
 */

import {RPCServer} from '../../bld/library';

import {IMyRPC, TestServicePrototype} from './shared';

class TestService implements TestServicePrototype {
  test(data: object): string {
    if (!('body' in data)) {
      throw new Error('body does not exist in data');
    }

    return `Hello, ${JSON.stringify(data)}!`;
  }
}

let myRPC: IMyRPC = {
  test: new TestService(),
};

async function main(): Promise<void> {
  let server = new RPCServer(myRPC);

  server.start(8013);
}

main().catch(console.error);
