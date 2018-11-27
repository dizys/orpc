import {SocketIOServer} from '../server';
import {CallData} from '../shared';

export class ProxyServer {
  private socketIO: SocketIOServer;

  constructor() {
    this.socketIO = new SocketIOServer();

    this.socketIO.on('connection', socket => {
      socket.on('call', (service: string, data: CallData) => {});
    });
  }

  start(port?: number, hostname?: string): void {
    this.socketIO.start(port, hostname);
  }

  stop(): void {
    this.socketIO.stop();
  }
}
