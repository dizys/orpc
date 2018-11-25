# orpc

The Node.js and browser RPC library built on top of socket.io

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
