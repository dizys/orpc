[![NPM Package](https://badge.fury.io/js/orpc.svg)](https://www.npmjs.com/package/orpc) [![Build Status](https://travis-ci.org/dizys/orpc.svg?branch=master)](https://travis-ci.org/dizys/orpc)

# orpc

The type-safe Node.js and browser RPC library built on top of socket.io. Empowered with AOC governance and load balancing.

## Installation

```sh
yarn add orpc
```

## Quick Start

`shared.ts`

```ts
export interface HelloServicePrototype extends ServicePrototype {
  say(name: string): string;
}

export interface MyRPCSchema extends RPCSchema {
  hello: HelloServicePrototype;
}
```

`server.ts`

```ts
class HelloService implements HelloServicePrototype {
  say(name: string): string {
    return `Hello, ${name}!`;
  }
}

let myRPC: MyRPCSchema = {
  hello: new HelloService(),
};

const server = new RPCServer(myRPC);

server.start(8013);
```

`client.ts`

```ts
let rpc = createClient<MyRPCSchema>('http://localhost:8013/');

let result = await rpc.hello.say('dizy'); // Type-safe

console.log(result); // 'Hello, dizy!'
```

## Core Concepts

> `ServicePrototype` and `RPCSchema` should be shared between client and server. `Service` should be implemented only on server.

### Service Prototype

A service prototype is an interface that defines the signature of the methods provided in the service. This is shared between both server and client side, so it will help type both our server implementation and client usage.

```ts
interface FileServicePrototype extends ServicePrototype {
  list(dir: string): Promise<FileInfo[]>;
  upload(file: Buffer, saveToDir: string): Promise<void>;
  download(path: string): Promise<Buffer>;
  delete(path: string): Promise<boolean>;
  rename(oldPath: string, newPath: string): Promise<boolean>;
}
```

### RPC Schema

In order to run multiple services on one single server, we build RPC schema to assemble these services into one bigger type. This is also shared between client and server.

```ts
interface MyRPCSchema extends RPCSchema {
  file: FileServicePrototype;
  system: SystemServicePrototype;
  blog: BlogServicePrototype;
}
```

### Service

Service is implemented in a form of `Class`. And it could be considered as a collection of methods ready to be remotely called. It is expected to implement the corresponding `ServerPrototype` on server.

```ts
class FileService implements FileServicePrototype{
  async list(dir: string): Promise<FileInfo[]>{
    let files = await //...implementation

    return files;
  }

  //...
}
```

### Gateway

`Gateway` is like a reverse proxy that takes clients' calls and sends them to one of the known servers, then gets results and feed them back to clients. To clients, a `Gateway` behaves exactly like a `RPCServer`, except its performance compete with several servers combined. `Gateway` is especially useful for high-cpu-usage services. Also, `Gateway` supports AOC governance and load balancing, so it can make sure services are highly-available and calls are well-balanced in terms of distribution to servers.

```ts
let config = {
  servers: [
    {url: 'http://localhost:8021/', weight: 10},
    {url: 'http://localhost:8022/', weight: 3},
    {url: 'http://localhost:8023/', weight: 4},
  ], // Servers' info
  loadBalancer: smoothWRRLoadBalancer, // built-in Smooth-Weighted-Round-Robin LoadBalancer
  log: {debug: true}, // Turn on debug mode
};

let gateway = new Gateway(config);

gateway.start(8014);
```

## APIs

### RPCServer

- `constructor (rpcSchema?: SchemaImplement<Schema>)`
- methods:

  - `start(port?: number, hostname?: string): void`

    `port` defaults to `80`, hostname defaults to `'localhost'`

  - `stop(): void`

  - `register(name: string, service: object): void`

  - `register(name: string, service: ServiceConstructor, initializeForEachClient?: boolean): void`

    Dynamically register new service. `initializeForEachClient` defaults to `false`

  - `unregister(name: string): boolean`

    Dynamically cancel registered service.

### createClient()

- parameters:

  - `url`?: string

    Defaults to `'http://localhost/'`

- returns:

  - `RPCClient<RPCSchema>`

- usages:

  ```ts
  let rpc = createClient<MyRPCSchema>(8080);

  let result = await rpc.myService.methodA(...args);
  ```

### RPCClient

`RPCClient` should always be created by `createClient`. That way, service and schema type information will be attached to it.

- `constructor (url?: string)`
- methods:

  - `open(): void`

    Open connection. Automatically called when created.

  - `close(): void`

  - `call(service: string, data: CallData): Promise<any>`

  - `call(service: string, method: string, params: any[], options: CallOptions): Promise<any>`

    Call remote service method.

### Gateway

#### GatewayConfig

```ts
let config: GatewayConfig = {
  servers: [
    {url: 'http://localhost:8015', weight: 10},
    {url: 'http://localhost:8016', weight: 4},
    {url: 'http://localhost:8017', weight: 6},
  ], // Servers' info
  loadBalancer: smoothWRRLoadBalancer, // Optional: defaults to `evenLoadBalancer`.
  downgrade: true, // Optional: defaults to `true`.
  downgradeAtAnyError: false, // Whether any error thrown by server will cause its downgrade. Optional: defaults to `false`.
  downgradeTolerantTime: 3, // How many tolerant times to fail before the server is downgraded to `0` weight. Optional: defaults to `3`.
  downgradeDeadSleepTime: 5, // A many times can a `0` weight server be offered a chance to revive. Optional: defaults to `5`.
  log: {
    enable: true,
    debug: true,
  }, // Optional: Defaults to `{enable: true, debug: false}`
};
```

#### Gateway

- `constructor(config: GatewayConfig)`
- methods:

  - `start(port?: number, hostname?: string): void`

    Start gateway server. `port` defaults to `80`, hostname defaults to `'localhost'`

  - `stop(): void`

  - `reloadConfig(config: GatewayConfig): void`

- usage:

  see [Core Concepts](#Core-Concepts)

## License

MIT, see the [LICENSE](/LICENSE) file for details.
