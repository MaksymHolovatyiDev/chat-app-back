import {Types} from 'mongoose';

export interface MessageReq {
  userId: Types.ObjectId;
}

export interface UpdateMessageBody {
  text: string;
  messageId: string;
}
