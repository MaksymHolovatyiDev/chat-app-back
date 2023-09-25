import {Chat} from 'models/chat';
import {Messages} from 'models/messages';
import {BadRequestError} from 'routing-controllers';
import {ChatCreateMessageBody, ChatReq} from './ChatTypes';
import {app} from 'index';
import {User} from 'models/user';

export default class ChatServices {
  async getUserChat(req: ChatReq, id: string) {
    const chat = await Chat.findOne({users: {$all: [req.userId, id]}})
      .select({_id: {$toString: '$_id'}, messages: 1})
      .lean()
      .populate({
        path: 'messages',
        select: {
          _id: {$toString: '$_id'},
          user: {$toString: '$user'},
          text: 1,
        },
      });

    if (!chat) return {messages: []};

    return chat;
  }

  async sendChatMessage(req: ChatReq, body: ChatCreateMessageBody) {
    const {message, to} = body;
    const user = await User.findById(to);
    const mainUser = await User.findById(req.userId);
    const io = app.getIo();

    if (!to || !message || !user) throw new BadRequestError();

    const {_id} = await Messages.create({text: message, user: req.userId});

    if (user?.socketId)
      io.to(user?.socketId).emit('messageResponse', {
        _id,
        text: message,
        user: req.userId,
      });

    io.to(mainUser?.socketId).emit('messageResponse', {
      _id,
      text: message,
      user: req.userId,
    });

    const chat = await Chat.findOneAndUpdate(
      {users: {$all: [req.userId, user._id]}},
      {
        $push: {messages: _id},
      },
    ).select('_id');

    if (!chat) {
      const newChat = await Chat.create({
        users: [to, req.userId],
        messages: [_id],
      });

      return {_id: newChat._id};
    }

    return chat;
  }
}
