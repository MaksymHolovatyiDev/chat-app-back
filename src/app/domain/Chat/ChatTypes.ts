import {Types} from 'mongoose';

export interface ChatReq {
  userId: Types.ObjectId;
}

export interface ChatCreateMessageBody {
  to: string;
  message: string;
}

export interface CreateNewChatBody {
  chatUserId: string;
}

export interface findByMessage {
  text: string;
  chatUserId: string;
}