import {DynamicRunningServerInfo} from './gateway';

export type LoadBalancer = (servers: DynamicRunningServerInfo[]) => string[];

export const evenLoadBalancer: LoadBalancer = servers => {
  return servers.filter(server => server.weight > 0).map(server => server.url);
};

interface SmoothWRRDynamicServerInfo {
  url: string;
  weight: number;
  dynamicWeight: number;
}

export const smoothWRRLoadBalancer: LoadBalancer = serverInfos => {
  let servers: SmoothWRRDynamicServerInfo[] = serverInfos
    .filter(server => server.weight > 0)
    .map(server => ({
      url: server.url,
      weight: server.weight,
      dynamicWeight: 0,
    }));

  let result: string[] = [];

  let weightSum = 0;

  for (let server of servers) {
    weightSum += server.weight;
  }

  for (let i = 0; i < weightSum; i++) {
    let index = getNextServerIndex();

    result.push(servers[index].url);
  }

  return result;

  function getNextServerIndex(): number {
    let index = -1;
    let totalWeight = 0;

    for (let i = 0; i < servers.length; i++) {
      let server = servers[i];

      server.dynamicWeight += server.weight;
      totalWeight += server.weight;

      if (index === -1 || servers[index].dynamicWeight < server.dynamicWeight) {
        index = i;
      }
    }

    servers[index].dynamicWeight -= totalWeight;

    return index;
  }
};
