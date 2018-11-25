import {Server, createServer} from 'http';

import createSocketIO from 'socket.io';

export class SocketIOServer {
  http: Server;

  socket: SocketIO.Server;

  constructor() {
    this.http = createServer();
    this.socket = createSocketIO(this.http);
  }

  start(port?: number, hostname?: string): void {
    this.http.listen(port, hostname);
  }

  stop(): void {
    this.http.close();
  }
}
