import {createClient} from '../../bld/library';

import {MyRPCSchema} from './shared';

async function main(): Promise<void> {
  let rpc = createClient<MyRPCSchema>('http://localhost:8013/');

  let result = await rpc.hello.say('dizy');

  console.log(result);
}

main().catch(console.error);
