import authenticationMiddleware from 'middlewares/authenticationMiddleware';
import {
  Post,
  JsonController,
  UseBefore,
  Req,
  Body,
  Get,
  Param,
} from 'routing-controllers';
import ChatServices from './ChatService';
import {ChatCreateMessageBody, ChatReq} from './ChatTypes';

@JsonController('/Chat')
export default class Chat {
  public service = new ChatServices();

  @Get('/:id')
  @UseBefore(authenticationMiddleware())
  async getChat(@Req() req: ChatReq, @Param('id') id: string) {
    return this.service.getUserChat(req, id);
  }

  @Post()
  @UseBefore(authenticationMiddleware())
  async Chat(@Req() req: ChatReq, @Body() body: ChatCreateMessageBody) {
    return this.service.sendChatMessage(req, body);
  }
}
