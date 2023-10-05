import {Messages} from 'models/messages';
import {MessageReq, UpdateMessageBody} from './MessageTypes';
import {ForbiddenError} from 'routing-controllers';
import {app} from 'index';
import {User} from 'models/user';
import {ImageUtils} from 'helpers';

export default class MessageServices {
  async updateMessage(req: MessageReq, body: UpdateMessageBody) {
    const {messageId, text} = body;

    const userMessage = await Messages.findById(messageId);

    if (req.userId != userMessage?.owner) throw new ForbiddenError();

    const message = await Messages.findByIdAndUpdate(
      messageId,
      {text},
      {new: true},
    );

    this.socketMessage(message?.chatUsers);

    return message;
  }

  async deleteMessage(req: MessageReq, id: string) {
    const userMessage = await Messages.findById(id).select({
      owner: {$toString: '$owner'},
    });

    if (req.userId != userMessage?.owner) throw new ForbiddenError();

    const message = await Messages.findByIdAndDelete(id);

    this.socketMessage(message?.chatUsers);

    return message;
  }

  private async socketMessage(chatUsers: any) {
    const io = app.getIo();
    const user = await User.findById(chatUsers[0]);
    const mainUser = await User.findById(chatUsers[1]);

    if (user?.socketId) io.to(user?.socketId).emit('read');

    if (mainUser?.socketId) io.to(mainUser?.socketId).emit('read');
  }

  async getMessageImage(id: string) {
    return await ImageUtils.getImage(id);
  }
}
