import {Chat} from 'models/chat';
import {Messages} from 'models/messages';
import {BadRequestError, ForbiddenError} from 'routing-controllers';
import {ChatCreateMessageBody, ChatReq, CreateNewChatBody} from './ChatTypes';
import {app} from 'index';
import {User} from 'models/user';
import {Types} from 'mongoose';

export default class ChatServices {
  async getUserChats(req: ChatReq) {
    const chats = await Chat.find({users: {$in: [req.userId]}})
      .sort({updatedAt: -1})
      .select({
        _id: {$toString: '$_id'},
        messages: 1,
        unreadMessages: 1,
        unreadUser: {$toString: '$unreadUser'},
      })
      .lean()
      .populate({
        path: 'messages',
        options: {sort: {updatedAt: -1}, limit: 1},
        select: {
          _id: {$toString: '$_id'},
          owner: {$toString: '$owner'},
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

    return chats;
  }

  async getUserChatById(req: ChatReq, id: string) {
    const unread = await Messages.updateMany(
      {chatId: id, owner: {$ne: req.userId}, read: false},
      {$set: {read: true}},
    );

    let chat;
    if (unread.modifiedCount) {
      chat = await Chat.findByIdAndUpdate(
        id,
        {$set: {unreadMessages: 0}},
        {new: true},
      )
        .sort({updatedAt: -1})
        .select({_id: {$toString: '$_id'}, messages: 1})
        .lean()
        .populate({
          path: 'messages',
          select: {
            _id: {$toString: '$_id'},
            owner: {$toString: '$image'},
            image: 1,
            text: 1,
            createdAt: 1,
            delivered: 1,
            read: 1,
            reply: 1,
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

      const to = chat?.users.find(el => el._id !== req.userId);

      const user = await User.findById(to);
      const mainUser = await User.findById(req.userId);

      const io = app.getIo();

      if (user?.socketId) io.to(user?.socketId).emit('read');

      io.to(mainUser?.socketId).emit('read');
    } else {
      chat = await Chat.findById(id)
        .sort({updatedAt: -1})
        .select({_id: {$toString: '$_id'}, messages: 1})
        .lean()
        .populate({
          path: 'messages',
          select: {
            _id: {$toString: '$_id'},
            owner: {$toString: '$owner'},
            image: {$toString: '$image'},
            text: 1,
            createdAt: 1,
            delivered: 1,
            read: 1,
            reply: 1,
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
    }

    if (chat?.users.includes(req.userId)) throw new ForbiddenError();

    if (!chat) return [];

    return chat;
  }

  async createNewChat(req: ChatReq, body: CreateNewChatBody) {
    const {chatUserId} = body;

    const chat = await Chat.findOne({users: {$all: [req.userId, chatUserId]}});

    if (chat) throw new BadRequestError();
    if (!Types.ObjectId.isValid(req.userId)) throw new ForbiddenError();

    const newChat = await Chat.create({
      users: [chatUserId, req.userId],
      unreadUser: req.userId,
    });

    return {_id: newChat._id.toString()};
  }

  async sendChatMessage(req: ChatReq, body: ChatCreateMessageBody, file: any) {
    const {message, to, reply} = body;
    const user = await User.findById(to);
    const mainUser = await User.findById(req.userId);
    const io = app.getIo();

    if (!to || !message || !user) throw new BadRequestError();

    const createdMessage = new Messages({
      text: message,
      chatUsers: [req.userId, to],
      owner: req.userId,
      delivered: true,
    });

    if (reply.length) createdMessage.reply = reply;
    if (file) createdMessage.image = file.id;

    const chat = await Chat.findOneAndUpdate(
      {users: {$all: [req.userId, user._id]}},
      {
        $set: {unreadUser: to},
        $inc: {unreadMessages: 1},
        $push: {messages: createdMessage._id},
      },
    ).select('_id');

    if (!chat) throw new BadRequestError();

    createdMessage.chatId = chat._id;
    createdMessage.save();

    if (user?.socketId) {
      io.to(user?.socketId).emit('read');
      io.to(user?.socketId).emit('messageResponse', {
        _id: createdMessage._id,
        text: message,
        owner: req.userId,
        delivered: true,
        reply: createdMessage.reply,
        image: file,
      });
    }

    io.to(mainUser?.socketId).emit('read');
    io.to(mainUser?.socketId).emit('messageResponse', {
      _id: createdMessage._id,
      text: message,
      owner: req.userId,
      delivered: true,
      reply: createdMessage.reply,
      image: file,
    });

    return chat;
  }

  async findByMessage(req: ChatReq, text: string) {
    return await Messages.find({
      text: {$regex: text},
      chatUsers: {$in: [req.userId]},
    })
      .lean()
      .select({
        _id: {$toString: '$_id'},
        chatId: {$toString: '$chatId'},
        text: 1,
        createdAt: 1,
      })
      .populate({
        path: 'owner',
        select: {
          _id: {$toString: '$_id'},
          fullName: 1,
          socketId: 1,
          updatedAt: 1,
        },
      });
  }
}
