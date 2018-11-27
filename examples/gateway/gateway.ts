/**
 * ts-node --transpileOnly --project examples/gateway/tsconfig.json examples/gateway/gateway.ts
 */

import {Gateway} from '../../bld/library';

let gateway = new Gateway({} as any);
