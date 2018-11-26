/**
 * ts-node --transpileOnly --project examples/file-transfer/tsconfig.json examples/file-transfer/server.ts
 */

import * as FS from 'fs';
import * as Path from 'path';

import {RPCServer} from '../../bld/library';

import {FileTransferServicePrototype, IMyRPC} from './shared';

const SAVE_DIR_PATH = 'C:\\';
const SAVE_ICON_FILE_PATH = Path.join(SAVE_DIR_PATH, 'temp.png');

class FileTransferService implements FileTransferServicePrototype {
  save(file: Buffer): void {
    FS.writeFileSync(SAVE_ICON_FILE_PATH, file);
  }

  fetch(): Buffer {
    return FS.readFileSync(SAVE_ICON_FILE_PATH);
  }
}

let myRPC: IMyRPC = {
  file: new FileTransferService(),
};

async function main(): Promise<void> {
  let server = new RPCServer(myRPC);

  server.start(8013);
}

main().catch(console.error);
