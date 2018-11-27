import {CallData, RPCSchema} from '../shared';

import {error, success} from './respond';
import {SocketIOServer} from './socket-io';

interface ServiceConstructor<T = any> {
  new (): T;
}

export type ServiceInstance = object;

export type Service = ServiceConstructor | ServiceInstance;

export type InstanceAndClass<I> = I | ServiceConstructor<I>;

export type SchemaImplement<Schema> =
  | {[K in keyof Schema]: InstanceAndClass<Schema[K]>}
  | {};

export class RPCServer<Schema extends RPCSchema = any> {
  socketIO: SocketIOServer;

  private serviceMap = new Map<string, Service>();

  constructor(rpcSchema: SchemaImplement<Schema> = {}) {
    this.prepareSchema(rpcSchema);

    this.socketIO = new SocketIOServer();

    this.initializeSocketIO();
  }

  start(port?: number, hostname?: string): void {
    this.socketIO.start(port, hostname);
  }

  stop(): void {
    this.socketIO.stop();
  }

  register(
    name: string,
    service: ServiceConstructor,
    initializeForEachClient?: boolean,
  ): void;
  register(name: string, service: object): void;
  register(
    name: string,
    service: Service,
    initializeForEachClient?: boolean,
  ): void {
    if (isServiceConstructor(service) && !initializeForEachClient) {
      this.serviceMap.set(name, new service());
    } else {
      this.serviceMap.set(name, service);
    }
  }

  unregister(name: string): boolean {
    return this.serviceMap.delete(name);
  }

  private prepareSchema(rpcImplement: SchemaImplement<Schema>): void {
    for (let [key, service] of Object.entries(rpcImplement)) {
      this.register(key, service);
    }
  }

  private initializeSocketIO(): void {
    this.socketIO.socket.on('connection', async socket => {
      let socketServiceMap = this.initializeSocketServiceMap();

      socket.on('call', async (service: string, data: CallData) => {
        let {callUUID} = data;

        let serviceInstance = socketServiceMap.get(service);

        if (!serviceInstance) {
          serviceInstance = this.serviceMap.get(service);
        }

        if (!serviceInstance) {
          let response = error(callUUID, `Service ${service} not found`);
          socket.emit('respond', response);

          return;
        }

        try {
          let result = await executeService(serviceInstance, data);

          let response = success(callUUID, result);

          socket.emit('respond', response);
        } catch (_error) {
          let response = error(callUUID, _error);

          socket.emit('respond', response);
        }
      });
    });
  }

  private initializeSocketServiceMap(): Map<string, ServiceInstance> {
    let map = new Map<string, ServiceInstance>();

    for (let [name, service] of this.serviceMap.entries()) {
      if (isServiceConstructor(service)) {
        let serviceInstance = new service();
        map.set(name, serviceInstance);
      }
    }

    return map;
  }
}

export function isServiceConstructor(
  service: Service,
): service is ServiceConstructor {
  return typeof service === 'function';
}

async function executeService(
  serviceInstance: ServiceInstance,
  data: CallData,
): Promise<object> {
  let {method, params} = data;

  let service = serviceInstance as any;

  if (method in service && typeof service[method] === 'function') {
    if (!params) {
      params = [];
    }

    return service[method](...params);
  }

  throw new Error(`Method '${method}' not found.`);
}
