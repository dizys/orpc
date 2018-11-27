import {DynamicRunningServerInfo} from './gateway';

export type LoadBalancer = (servers: DynamicRunningServerInfo[]) => string[];

export const evenLoadBalancer: LoadBalancer = servers => {
  return servers.map(server => server.url);
};
