import {RPCSchema, RPCServer, ServicePrototype} from '../bld/library';

import {createClient, createGateway, createServer} from './utils';

jest.setTimeout(20000);

export interface HelloServicePrototype extends ServicePrototype {
  say(name: string): string;
  getKeys(object: object): string[];
  wrapData(name: string, age: number, gender: string): object;
  bufferEcho(body: Buffer): Buffer;
  sayPromise(name: string): Promise<string>;
  error(message: string): never;
}

export interface IMyRPC extends RPCSchema {
  hello: HelloServicePrototype;
}

class HelloService implements HelloServicePrototype {
  say(name: string): string {
    return `Hello, ${name}!`;
  }

  getKeys(object: object): string[] {
    return Object.keys(object);
  }

  wrapData(name: string, age: number, gender: string): object {
    return {
      name,
      age,
      gender,
    };
  }

  bufferEcho(body: Buffer): Buffer {
    return body;
  }

  error(message: string): never {
    throw new Error(message);
  }

  sayPromise(name: string): Promise<string> {
    return new Promise<string>(resolve => {
      resolve(`Hello, ${name}!`);
    });
  }
}

let myRPC: IMyRPC = {
  hello: new HelloService(),
};

let rpc = createClient<IMyRPC>(8014);

let server: RPCServer;

createServer(myRPC, 2015)
  .then(value => (server = value))
  .catch(console.error);

let gateway = createGateway();

test('simplest service method call', async () => {
  let result = await rpc.hello.say('Dizy');

  expect(result).toBe('Hello, Dizy!');
});

afterAll(() => {
  rpc.$portal.close();

  if (server) {
    server.stop();
  }

  gateway.stop();
});
