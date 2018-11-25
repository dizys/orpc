export interface CallOptions {}

export interface CallData {
  callUUID: string;
  method: string;
  params?: any[];
  options?: CallOptions;
}
