import {Chat} from 'models/chat';
import {Messages} from 'models/messages';
import {BadRequestError, ForbiddenError} from 'routing-controllers';
import {ChatCreateMessageBody, ChatReq, CreateNewChatBody} from './ChatTypes';
import {app} from 'index';
import {Types} from 'mongoose';
import {User} from 'models/user';

export default class ChatServices {
  async getUserChats(req: ChatReq) {
    const userId = new Types.ObjectId(req.userId);
    return await Chat.aggregate([
      {
        $match: {users: {$in: [userId]}},
      },
      {
        $sort: {updatedAt: -1},
      },
      {
        $lookup: {
          from: 'messages',
          localField: 'messages',
          foreignField: '_id',
          pipeline: [
            {
              $sort: {updatedAt: -1},
            },
            {
              $limit: 1,
            },
            {
              $project: {
                _id: {$toString: '$_id'},
                owner: {$toString: '$owner'},
                text: 1,
                createdAt: 1,
              },
            },
          ],
          as: 'chatMessage',
        },
      },
      {
        $lookup: {
          from: 'messages',
          localField: 'messages',
          foreignField: '_id',
          pipeline: [{$match: {read: {$nin: [userId]}, owner: {$ne: userId}}}],
          as: 'unreadCount',
        },
      },
      {$addFields: {unreadMessages: {$size: '$unreadCount'}}},
      {
        $project: {
          _id: {$toString: '$_id'},
          unreadMessages: 1,
          chatName: 1,
          chatMessage: 1,
          users: 1,
        },
      },

      {
        $lookup: {
          from: 'users',
          localField: 'users',
          foreignField: '_id',
          pipeline: [
            {$match: {_id: {$ne: userId}}},
            {
              $project: {
                _id: {$toString: '$_id'},
                fullName: 1,
                socketId: 1,
                updatedAt: 1,
              },
            },
          ],
          as: 'users',
        },
      },
    ]);
  }

  async getUserChatById(req: ChatReq, id: string) {
    const unread = await Messages.updateMany(
      {chatId: id, owner: {$ne: req.userId}, read: {$nin: [req.userId]}},
      {$push: {read: req.userId}},
    );

    const chat = await Chat.findOne({_id: id, users: {$in: req.userId}})
      .sort({updatedAt: -1})
      .select({_id: {$toString: '$_id'}, messages: 1, chatName: 1})
      .lean()
      .populate({
        path: 'messages',
        select: {
          _id: {$toString: '$_id'},
          image: 1,
          text: 1,
          createdAt: 1,
          delivered: 1,
          read: 1,
          reply: 1,
        },
        populate: {
          path: 'owner',
          select: {_id: {$toString: '$_id'}, fullName: 1},
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

    if (unread.modifiedCount) {
      const io = app.getIo();
      io.to(req.socketId).emit('read', id);

      chat?.users.forEach((el: any) => {
        if (el?.socketId) io.to(el?.socketId).emit('read', id);
      });
    }

    if (!chat) return [];

    return chat;
  }

  async createNewChat(req: ChatReq, body: CreateNewChatBody) {
    const {chatUsersId, chatName} = body;
    if (!chatName) {
      const chat = await Chat.findOne({
        users: {$all: [req.userId, chatUsersId]},
      });

      if (chat) throw new BadRequestError();
    }
    if (!Types.ObjectId.isValid(req.userId)) throw new ForbiddenError();

    const newChat = new Chat({
      users: [...chatUsersId, req.userId],
      unreadUser: req.userId,
    });

    if (chatName) newChat.chatName = chatName;

    await newChat.save();

    return {_id: newChat._id.toString()};
  }

  async sendChatMessage(req: ChatReq, body: ChatCreateMessageBody, file: any) {
    const {message, ChatId, reply} = body;
    const io = app.getIo();

    const createdMessage = new Messages({
      text: message,
      owner: req.userId,
      delivered: true,
    });

    if (reply.length) createdMessage.reply = reply;
    if (file) createdMessage.image = file.id;

    const chat = await Chat.findByIdAndUpdate(ChatId, {
      $push: {messages: createdMessage._id},
    });

    const users = await User.find({_id: {$in: chat?.users}});

    if (!chat) throw new BadRequestError();

    createdMessage.chatId = chat._id;
    createdMessage.save();

    users.forEach(el => {
      if (el?.socketId) {
        io.to(el?.socketId).emit('read', ChatId);
        io.to(el?.socketId).emit('messageResponse', {
          _id: createdMessage._id,
          text: message,
          owner: req.userId,
          delivered: true,
          reply: createdMessage.reply,
          image: file,
        });
      }
    });

    return chat;
  }

  async findByMessage(req: ChatReq, text: string) {
    const userId = new Types.ObjectId(req.userId);
    return await Messages.aggregate([
      {
        $lookup: {
          from: 'chats',
          localField: 'chatId',
          foreignField: '_id',
          pipeline: [
            {$match: {users: {$elemMatch: {$eq: userId}}}},
            {
              $project: {
                users: 1,
              },
            },
          ],
          as: 'messageChat',
        },
      },
      {
        $match: {
          text: {$regex: text},
          'messageChat.users': {$elemMatch: {$eq: userId}},
        },
      },

      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          pipeline: [
            {
              $project: {
                _id: {$toString: '$_id'},
                fullName: 1,
                socketId: 1,
                updatedAt: 1,
              },
            },
          ],

          as: 'owner',
        },
      },
      {
        $project: {
          _id: {$toString: '$_id'},
          chatId: {$toString: '$chatId'},
          text: 1,
          createdAt: 1,
          owner: 1,
        },
      },
    ]);
  }
}
