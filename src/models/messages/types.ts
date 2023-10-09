import {Types} from 'mongoose';

export interface MessagesSavedModel {
  text: string;
  owner: Types.ObjectId;
  chatId: Types.ObjectId;
  delivered: boolean;
  read: boolean;
  reply: [Types.ObjectId, string];
  image: Types.ObjectId;
}
