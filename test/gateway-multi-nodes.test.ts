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

let rpc = createClient<IMyRPC>(8016);

let server1: RPCServer;

createServer(myRPC, 8017)
  .then(value => (server1 = value))
  .catch(console.error);

let server2: RPCServer;

createServer(myRPC, 8018)
  .then(value => (server2 = value))
  .catch(console.error);

let server3: RPCServer;

createServer(myRPC, 8019)
  .then(value => (server3 = value))
  .catch(console.error);

let gateway = createGateway(
  {
    servers: [
      {url: 'http://localhost:8017/'},
      {url: 'http://localhost:8018/'},
      {url: 'http://localhost:8019/'},
    ],
    log: {debug: true},
  },
  8016,
);

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

test('simplest service method call retry', async () => {
  let result = await rpc.hello.say('Oliver');

  expect(result).toBe('Hello, Oliver!');
});

test('method call with object parameter retry', async () => {
  let keys = await rpc.hello.getKeys({
    name: 'Oliver',
    age: 22,
    gender: 'male',
  });

  expect(keys).toEqual(['name', 'age', 'gender']);
});

test('method return object retry', async () => {
  let object = await rpc.hello.wrapData('Oliver', 22, 'male');

  expect(object).toEqual({
    name: 'Oliver',
    age: 22,
    gender: 'male',
  });
});

test('method transfer Buffer retry', async () => {
  let buffer = Buffer.alloc(100, 'hooray retry!');

  let result = await rpc.hello.bufferEcho(buffer);

  expect(result).toEqual(buffer);
});

test('remote error throwing retry', async () => {
  let message: string | undefined;

  try {
    await rpc.hello.error('Remote error retry');
  } catch (error) {
    message = error.message;
  }

  expect(message).toBe('Remote error retry');
});

test('method implemented as promise retry', async () => {
  let result = await rpc.hello.sayPromise('Oliver');

  expect(result).toBe('Hello, Oliver!');
});

afterAll(() => {
  rpc.$portal.close();

  if (server1) {
    server1.stop();
  }

  if (server2) {
    server2.stop();
  }

  if (server3) {
    server3.stop();
  }

  gateway.stop();
});
