[![NPM Package](https://badge.fury.io/js/orpc.svg)](https://www.npmjs.com/package/orpc) [![Build Status](https://travis-ci.org/dizys/orpc.svg?branch=master)](https://travis-ci.org/dizys/orpc)

# orpc

The type-safe Node.js and browser RPC library built on top of socket.io

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
