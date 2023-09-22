import {Server} from 'socket.io';
import {DefaultEventsMap} from 'socket.io/dist/typed-events';

export function socketConnect(
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
) {
  io.on('connection', socket => {
    console.log(`⚡: ${socket.id} user just connected!`);
    socket.on('message', data => {
      io.emit('messageResponse', data);
    });

    socket.on('disconnect', () => {
      console.log('🔥: A user disconnected');
    });
  });
}
