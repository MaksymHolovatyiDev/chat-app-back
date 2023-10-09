import {Types} from 'mongoose';

export interface ChatSavedModel {
  users: [Types.ObjectId, Types.ObjectId];
  messages: Types.ObjectId[];
  unreadUser: Types.ObjectId;
  unreadMessages: number;
  chatName: string;
}
