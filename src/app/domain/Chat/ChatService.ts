import {Chat} from 'models/chat';
import {Messages} from 'models/messages';
import {BadRequestError, ForbiddenError} from 'routing-controllers';
import {
  ChatCreateMessageBody,
  ChatReq,
  CreateNewChatBody,
  findByMessage,
} from './ChatTypes';
import {app} from 'index';
import {User} from 'models/user';

export default class ChatServices {
  async getUserChats(req: ChatReq) {
    const chats = await Chat.find({users: {$in: [req.userId]}})
      .sort({updatedAt: -1})
      .select({_id: {$toString: '$_id'}, messages: 1})
      .lean()
      .populate({
        path: 'messages',
        options: {sort: {updatedAt: -1}, limit: 1},
        select: {
          _id: {$toString: '$_id'},
          user: {$toString: '$user'},
          text: 1,
          createdAt: 1,
        },
      })
      .populate({
        path: 'users',
        match: {_id: {$ne: req.userId}},
        select: {
          _id: {$toString: '$_id'},
          fullName: 1,
          socketId: 1,
          updatedAt: 1,
        },
      });

    if (chats.length === 0) return [];

    return chats;
  }

  async getUserChatById(req: ChatReq, id: string) {
    const chats = await Chat.findById(id)
      .sort({updatedAt: -1})
      .select({_id: {$toString: '$_id'}, messages: 1})
      .lean()
      .populate({
        path: 'messages',
        select: {
          _id: {$toString: '$_id'},
          user: {$toString: '$user'},
          text: 1,
          createdAt: 1,
        },
      })
      .populate({
        path: 'users',
        match: {_id: {$ne: req.userId}},
        select: {
          _id: {$toString: '$_id'},
          fullName: 1,
          socketId: 1,
          updatedAt: 1,
        },
      });

    if (chats?.users.includes(req.userId)) throw new ForbiddenError();

    if (!chats) return [];

    return chats;
  }

  async createNewChat(req: ChatReq, body: CreateNewChatBody) {
    const {chatUserId} = body;

    const user = await User.findById(req.userId);

    if (user?.chats.includes(chatUserId)) throw new BadRequestError();

    const newChat = await Chat.create({
      users: [chatUserId, req.userId],
    });

    await User.findByIdAndUpdate(req.userId, {
      $push: {chats: chatUserId},
    });
    await User.findByIdAndUpdate(chatUserId, {
      $push: {chats: req.userId},
    });

    return {_id: newChat._id};
  }

  async sendChatMessage(req: ChatReq, body: ChatCreateMessageBody) {
    const {message, to} = body;
    const user = await User.findById(to);
    const mainUser = await User.findById(req.userId);
    const io = app.getIo();

    if (!to || !message || !user) throw new BadRequestError();

    const {_id} = await Messages.create({
      text: message,
      users: [req.userId, to],
    });

    const chat = await Chat.findOneAndUpdate(
      {users: {$all: [req.userId, user._id]}},
      {
        $push: {messages: _id},
      },
    ).select('_id');

    if (!chat) throw new BadRequestError();

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

    return chat;
  }

  async findByMessage(req: ChatReq, body: findByMessage) {
    const {text, chatUserId} = body;

    return await Messages.find({
      text: {$regex: text},
      users: {$all: [req.userId, chatUserId]},
    });
  }
}
