import {Types} from 'mongoose';

export interface MessagesSavedModel {
  text: string;
  users: Types.ObjectId[];
}
