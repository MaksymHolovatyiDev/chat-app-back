import {Messages} from 'models/messages';
import {MessageReq, UpdateMessageBody} from './MessageTypes';
import {ForbiddenError} from 'routing-controllers';
import {app} from 'index';
import {ImageUtils} from 'helpers';
import {Chat} from 'models/chat';

export default class MessageServices {
  async updateMessage(req: MessageReq, body: UpdateMessageBody) {
    const {messageId, text} = body;

    const userMessage = await Messages.findById(messageId);

    if (req.userId.toString() !== userMessage?.owner.toString())
      throw new ForbiddenError();

    const message = await Messages.findByIdAndUpdate(
      messageId,
      {text},
      {new: true},
    );

    const chat = await Chat.findById(message?.chatId).populate({
      path: 'users',
      select: {
        socketId: 1,
      },
    });

    this.socketMessage(chat?.users, chat?._id);

    return message;
  }

  async deleteMessage(req: MessageReq, id: string) {
    const userMessage = await Messages.findById(id).select({
      owner: {$toString: '$owner'},
    });

    if (req.userId.toString() !== userMessage?.owner.toString())
      throw new ForbiddenError();

    const message = await Messages.findByIdAndDelete(id);

    const chat = await Chat.findByIdAndUpdate(message?.chatId, {
      $pull: {messages: message?._id},
    }).populate({
      path: 'users',
      select: {
        socketId: 1,
      },
    });

    this.socketMessage(chat?.users, chat?._id);

    return message;
  }

  private async socketMessage(chatUsers: any, chat: any) {
    const io = app.getIo();

    chatUsers.forEach((el: any) => {
      if (el?.socketId) io.to(el?.socketId).emit('read', chat);
    });
  }

  async getMessageImage(id: string) {
    return await ImageUtils.getImage(id);
  }
}
