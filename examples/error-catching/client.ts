/**
 * ts-node --transpileOnly --project examples/error-catching/tsconfig.json examples/error-catching/client.ts
 */

import {createClient} from '../../bld/library';

import {IMyRPC} from './shared';

async function main(): Promise<void> {
  let rpc = createClient<IMyRPC>('http://localhost:8013/');

  try {
    let result = await rpc.test.test({notBody: 'what'});

    console.log(result);
  } catch (error) {
    console.log('Remote threw ', error);
  }
}

main().catch(console.error);
