import Socket from 'socket.io-client';

export class SocketIOClient {
  socket: SocketIOClient.Socket;

  constructor(url: string = 'https://localhost') {
    this.socket = Socket(url);
  }

  open(): void {
    this.socket.open();
  }

  close(): void {
    this.socket.close();
  }

  on(event: string, fn: Function): SocketIOClient.Emitter {
    return this.socket.on(event, fn);
  }

  once(event: string, fn: Function): SocketIOClient.Emitter {
    return this.socket.once(event, fn);
  }

  off(event: string, fn?: Function): SocketIOClient.Emitter {
    return this.socket.off(event, fn);
  }

  removeAllListeners(): SocketIOClient.Emitter {
    return this.socket.removeAllListeners();
  }

  emit(event: string, ...args: any[]): SocketIOClient.Emitter {
    return this.socket.emit(event, ...args);
  }

  getListeners(event: string): Function[] {
    return this.socket.listeners(event);
  }

  hasListeners(event: string): boolean {
    return this.socket.hasListeners(event);
  }
}
