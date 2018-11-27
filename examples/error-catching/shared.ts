import {RPCSchema, ServicePrototype} from '../../bld/library';

export interface TestServicePrototype extends ServicePrototype {
  test(data: object): string;
}

export interface IMyRPC extends RPCSchema {
  test: TestServicePrototype;
}
