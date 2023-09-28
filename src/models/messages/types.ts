import {Types} from 'mongoose';

export interface MessagesSavedModel {
  text: string;
  chatUsers: Types.ObjectId[];
  owner: Types.ObjectId;
  chatId: Types.ObjectId;
  delivered: boolean;
  read: boolean;
}
