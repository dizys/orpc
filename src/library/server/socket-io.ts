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
    this.socket.close();
    this.http.close();
  }

  on(
    event: 'connection',
    listener: (socket: SocketIO.Socket) => void,
  ): SocketIO.Namespace;
  on(event: string, listener: Function): SocketIO.Namespace {
    return this.socket.on(event, listener);
  }

  emit(event: string, ...args: any[]): SocketIO.Namespace {
    return this.socket.emit(event, ...args);
  }
}
