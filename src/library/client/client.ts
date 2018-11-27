import uuid from 'uuid';

import {
  CallData,
  CallOptions,
  RPCSchema,
  RespondCode,
  RespondData,
  ServicePrototype,
} from '../shared';

import {SocketIOClient} from './socket-io-client';

type ServiceMethod<T = any> = (...args: any[]) => T;

type PromisifyFunction<F extends ServiceMethod> = ReturnType<F> extends Promise<
  any
>
  ? F
  : (...params: Parameters<F>) => Promise<ReturnType<F>>;

type SelectOutMethodAndPromisify<S extends ServicePrototype> = {
  [K in keyof S]: S[K] extends ServiceMethod ? PromisifyFunction<S[K]> : never
};

export type RPCClient<Schema extends RPCSchema> = {
  [K in keyof Schema]: SelectOutMethodAndPromisify<Schema[K]>
} & {
  $portal: Client;
};

export interface CallInfo {
  callUUID: string;
  resolve(result?: any): void;
  reject(reason: any): void;
}

export class Client {
  socketIO: SocketIOClient;

  callInfoSet = new Map<string, CallInfo>();

  constructor(url?: string) {
    this.socketIO = new SocketIOClient(url);

    this.initializeSocketIO();
  }

  open(): void {
    this.socketIO.open();
  }

  close(): void {
    this.socketIO.close();
  }

  async call(
    service: string,
    method: string,
    params: any[],
    options: CallOptions,
  ): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      let callUUID = uuid();

      let callData: CallData = {
        callUUID,
        method,
        params,
        options,
      };

      let callInfo: CallInfo = {callUUID, resolve, reject};

      this.callInfoSet.set(callUUID, callInfo);

      this.socketIO.socket.emit('call', service, callData);
    });
  }

  private initializeSocketIO(): void {
    this.socketIO.socket.on('respond', (response: RespondData) => {
      let {callUUID, code, body} = response;

      let callInfo = this.callInfoSet.get(callUUID);

      if (!callInfo) {
        throw new Error(`Uncaught response '${callUUID}'`);
      }

      let {resolve, reject} = callInfo;

      switch (code) {
        case RespondCode.failure:
          reject(new Error(body));
          break;
        case RespondCode.success:
          resolve(body);
          break;
      }
    });
  }
}

export function createClient<Schema extends RPCSchema>(
  url?: string,
): RPCClient<Schema> {
  let object = {$portal: new Client(url)};

  let handler: ProxyHandler<typeof object> = {
    get(target, service: string): any {
      let methodHandler: ProxyHandler<{}> = {
        get(_target, method: string): any {
          return async (...args: any[]): Promise<any> => {
            return target.$portal.call(service, method, args, {});
          };
        },
      };

      return new Proxy({}, methodHandler);
    },
  };

  return new Proxy(object, handler) as RPCClient<Schema>;
}
