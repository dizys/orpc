import {DynamicRunningServerInfo} from './gateway';

export type LoadBalancer = (servers: DynamicRunningServerInfo[]) => string[];

export const evenLoadBalancer: LoadBalancer = servers => {
  return servers.filter(server => server.weight > 0).map(server => server.url);
};
