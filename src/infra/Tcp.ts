import 'reflect-metadata';
import express from 'express';
import {useExpressServer} from 'routing-controllers';
import {createServer} from 'http';
import {Server} from 'socket.io';
import {controllers} from 'app/domain';
import {Sockets} from './Sockets';

const {PORT} = process.env;

export class Tcp {
  private static instance: Tcp;

  private routePrefix = '/api';
  private socket = new Sockets();
  public server = express();

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

    await this.socket.init(io, server);

    useExpressServer(server, {
      routePrefix,
      controllers,
      cors: true,
      defaultErrorHandler: true,
    });

    return new Promise((resolve: any) => {
      http.listen(PORT || 4000, () => {
        console.log(`Tcp started on port ${PORT}!`);
      });

      return resolve(true);
    });
  }
}
