import {CallData} from './call';

export enum RespondCode {
  success = 'SUCCESS',
  failure = 'FAILURE',
}

export interface RespondData {
  callUUID: string;
  code: RespondCode;
  body: any;
  callData?: CallData;
}
