/**
 * ts-node --transpileOnly --project examples/gateway/tsconfig.json examples/gateway/client.ts
 */

import {createClient} from '../../bld/library';

import {IMyRPC} from './shared';

async function main(): Promise<void> {
  // URL for gateway
  let rpc = createClient<IMyRPC>('http://localhost:8014/');

  let result = await rpc.hello.say('dizy');

  console.log(result);

  result = await rpc.hello.say('dizy2');

  console.log(result);

  result = await rpc.hello.say('dizy3');

  console.log(result);

  result = await rpc.hello.say('dizy4');

  console.log(result);

  result = await rpc.hello.say('dizy5');

  console.log(result);

  result = await rpc.hello.say('dizy6');

  console.log(result);

  result = await rpc.hello.say('dizy7');

  console.log(result);
}

main().catch(console.error);
