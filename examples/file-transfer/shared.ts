import {RPCSchema, ServicePrototype} from '../../bld/library';

export interface FileTransferServicePrototype extends ServicePrototype {
  save(file: Buffer): void;
  fetch(): Buffer;
}

export interface IMyRPC extends RPCSchema {
  file: FileTransferServicePrototype;
}
