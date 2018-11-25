import {CallData, RespondCode, RespondData} from '../shared';

export function generateRespond(
  callUUID: string,
  code: RespondCode,
  body?: any,
  callData?: CallData,
): RespondData {
  return {
    callUUID,
    code,
    body,
    callData,
  };
}

export function success(callUUID: string, body?: any): RespondData {
  return generateRespond(callUUID, RespondCode.success, body);
}

export function error(callUUID: string, message: any): RespondData {
  return generateRespond(callUUID, RespondCode.failure, message);
}
