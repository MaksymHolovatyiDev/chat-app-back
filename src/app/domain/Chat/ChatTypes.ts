import {Types} from 'mongoose';

export interface ChatReq {
  userId: Types.ObjectId;
  socketId: string;
}

export interface ChatCreateMessageBody {
  ChatId: string;
  message: string;
  reply: [Types.ObjectId, string] | [];
}

export interface CreateNewChatBody {
  chatUsersId: [string];
  chatName?: string;
}
