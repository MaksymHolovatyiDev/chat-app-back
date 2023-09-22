import {Server} from 'socket.io';
import {Express} from 'express';
import {DefaultEventsMap} from 'socket.io/dist/typed-events';

export class Sockets {
  private static instance: Sockets;

  constructor() {
    if (!Sockets.instance) Sockets.instance = this;
    return Sockets.instance;
  }

  async init(
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    server: Express,
  ) {
    await server.use((req: any, _, next) => {
      req.io = io;
      next();
    });
    return io.on('connection', socket => {
      console.log(`⚡: ${socket.id} user just connected!`);
      socket.on('message', data => {
        io.emit('messageResponse', data);
      });

      socket.on('disconnect', () => {
        console.log('🔥: A user disconnected');
      });
    });
  }
}
