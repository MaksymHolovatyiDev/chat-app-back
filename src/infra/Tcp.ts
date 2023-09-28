import 'reflect-metadata';
import express from 'express';
import {useExpressServer} from 'routing-controllers';
import {createServer} from 'http';
import {Server} from 'socket.io';
import {controllers} from 'app/domain';
import {User} from 'models/user';
import {DefaultEventsMap} from 'socket.io/dist/typed-events';

export class Sockets {
  private static instance: Sockets;

  constructor() {
    if (!Sockets.instance) Sockets.instance = this;
    return Sockets.instance;
  }

  init(io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
    io.use(async (socket: any, next: any) => {
      const userId = socket.handshake.auth.userId;
      if (!userId) {
        return next(new Error('Invalid id!'));
      }
      const user = await User.findByIdAndUpdate(userId, {socketId: socket.id});
      if (!user) {
        return next(new Error('Invalid id!'));
      }

      (socket as any).userId = userId;
      next();
    });

    io.on('connection', (socket: any) => {
      console.log(`⚡: ${socket.id} user just connected!`);
      socket.on('disconnect', async () => {
        await User.findByIdAndUpdate(socket.userId, {socketId: null});
        console.log('🔥: A user disconnected');
      });
    });
  }
}

const {PORT} = process.env;

export class Tcp {
  private static instance: Tcp;

  private routePrefix = '/api';
  private sockets = new Sockets();
  public server = express();
  public io: any;

  constructor() {
    if (!Tcp.instance) Tcp.instance = this;
    return Tcp.instance;
  }

  async init() {
    const {server, routePrefix} = this;
    const http = createServer(server);
    const io = new Server(http, {
      cors: {
        origin: '*',
      },
    });

    this.io = io;

    useExpressServer(server, {
      routePrefix,
      controllers,
      cors: true,
      defaultErrorHandler: true,
    });

    this.sockets.init(io);

    return new Promise((resolve: any) => {
      http.listen(PORT || 4000, () => {
        console.log(`Tcp started on port ${PORT}!`);
      });

      return resolve(true);
    });
  }

  getIo() {
    return this.io;
  }
}
