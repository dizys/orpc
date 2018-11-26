export interface ServicePrototype {}

export interface RPCSchema {
  [key: string]: ServicePrototype;
}