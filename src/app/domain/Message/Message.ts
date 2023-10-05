import authenticationMiddleware from 'middlewares/authenticationMiddleware';
import {
  Post,
  JsonController,
  UseBefore,
  Req,
  Body,
  Param,
  Delete,
  Get,
} from 'routing-controllers';
import MessageServices from './MessageService';
import {MessageReq, UpdateMessageBody} from './MessageTypes';
import {ChatReq} from '../Chat/ChatTypes';

@JsonController('/Message')
export default class Message {
  public service = new MessageServices();

  @Post()
  @UseBefore(authenticationMiddleware())
  async UpdateMessage(@Req() req: MessageReq, @Body() body: UpdateMessageBody) {
    return this.service.updateMessage(req, body);
  }

  @Delete('/:id')
  @UseBefore(authenticationMiddleware())
  async getChatById(@Req() req: ChatReq, @Param('id') id: string) {
    return this.service.deleteMessage(req, id);
  }

  @Get('/image/:id')
  async getMessageImage(@Param('id') id: string) {
    return this.service.getMessageImage(id);
  }
}
