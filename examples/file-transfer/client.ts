/**
 * ts-node --transpileOnly --project examples/file-transfer/tsconfig.json examples/file-transfer/client.ts
 */

import * as FS from 'fs';
import * as Path from 'path';

import {createClient} from '../../bld/library';

import {IMyRPC} from './shared';

const ICON_FILE_PATH = Path.join(__dirname, 'icon.png');

async function main(): Promise<void> {
  let rpc = createClient<IMyRPC>('http://localhost:8013/');

  let file = FS.readFileSync(ICON_FILE_PATH);

  await rpc.file.save(file);

  let receivedFile = await rpc.file.fetch();

  console.log('received:', receivedFile);
}

main().catch(console.error);
