import {User} from 'models/user';
import {Server} from 'socket.io';
import {DefaultEventsMap} from 'socket.io/dist/typed-events';

export default class Sockets {
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
