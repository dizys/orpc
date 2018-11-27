import {RPCSchema, RPCServer, ServicePrototype} from '../bld/library';

import {createClient, createServer} from './utils';

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

let rpc = createClient<IMyRPC>();

let server: RPCServer;

createServer(myRPC)
  .then(value => (server = value))
  .catch(console.error);

test('simplest service method call', async () => {
  let result = await rpc.hello.say('Dizy');

  expect(result).toBe('Hello, Dizy!');
});

test('method call with object parameter', async () => {
  let keys = await rpc.hello.getKeys({
    name: 'Dizy',
    age: 20,
    gender: 'male',
  });

  expect(keys).toEqual(['name', 'age', 'gender']);
});

test('method return object', async () => {
  let object = await rpc.hello.wrapData('Dizy', 20, 'male');

  expect(object).toEqual({
    name: 'Dizy',
    age: 20,
    gender: 'male',
  });
});

test('method transfer Buffer', async () => {
  let buffer = Buffer.alloc(100, 'hooray!');

  let result = await rpc.hello.bufferEcho(buffer);

  expect(result).toEqual(buffer);
});

test('remote error throwing', async () => {
  let message: string | undefined;

  try {
    await rpc.hello.error('Remote error');
  } catch (error) {
    message = error.message;
  }

  expect(message).toBe('Remote error');
});

test('method implemented as promise', async () => {
  let result = await rpc.hello.sayPromise('Dizy');

  expect(result).toBe('Hello, Dizy!');
});

afterAll(() => {
  rpc.$portal.close();

  if (server) {
    server.stop();
  }
});
