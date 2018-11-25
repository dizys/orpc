import {RPCSchema, ServicePrototype} from '../../bld/library';

export interface HelloServicePrototype extends ServicePrototype {
  say(name: string): string;
}

export interface MyRPCSchema extends RPCSchema {
  hello: HelloServicePrototype;
}
