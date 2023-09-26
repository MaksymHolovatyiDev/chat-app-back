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
import {ChatCreateMessageBody, ChatReq, CreateNewChatBody, findByMessage} from './ChatTypes';

@JsonController('/Chat')
export default class Chat {
  public service = new ChatServices();

  @Get()
  @UseBefore(authenticationMiddleware())
  async getChats(@Req() req: ChatReq) {
    return this.service.getUserChats(req);
  }

  @Get('/:id')
  @UseBefore(authenticationMiddleware())
  async getChatById(@Req() req: ChatReq, @Param('id') id: string) {
    return this.service.getUserChatById(req, id);
  }

  @Post('/create')
  @UseBefore(authenticationMiddleware())
  async CreateChat(@Req() req: ChatReq, @Body() body: CreateNewChatBody) {
    return this.service.createNewChat(req, body);
  }

  @Post()
  @UseBefore(authenticationMiddleware())
  async Chat(@Req() req: ChatReq, @Body() body: ChatCreateMessageBody) {
    return this.service.sendChatMessage(req, body);
  }

  @Post('/message')
  @UseBefore(authenticationMiddleware())
  async findByMessage(@Req() req: ChatReq, @Body() body: findByMessage) {
    return this.service.findByMessage(req, body);
  }
}
