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
}
