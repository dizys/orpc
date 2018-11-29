/**
 * ts-node --transpileOnly --project examples/gateway/tsconfig.json examples/gateway/gateway.ts
 */

import {Gateway, GatewayConfig} from '../../bld/library';

let config: GatewayConfig = {
  servers: [{url: 'http://localhost:8015', weight: 1}],
  log: {
    debug: true,
  },
};

let gateway = new Gateway(config);

gateway.start(8014);
