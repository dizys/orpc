/**
 * ts-node --transpileOnly --project examples/helloworld/tsconfig.json examples/helloworld/client.ts
 */

import {createClient} from '../../bld/library';

import {IMyRPC} from './shared';

async function main(): Promise<void> {
  let rpc = createClient<IMyRPC>('http://localhost:8013/');

  let result = await rpc.hello.say('dizy');

  console.log(result);
}

main().catch(console.error);
