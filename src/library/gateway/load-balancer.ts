import {RunningServerInfo} from './gateway';

export type LoadBalancer = (servers: RunningServerInfo[]) => string[];

export const evenLoadBalancer: LoadBalancer = servers => {
  return servers.map(server => server.url);
};
