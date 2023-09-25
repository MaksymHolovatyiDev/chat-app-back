import {Types} from 'mongoose';

export interface MessagesSavedModel {
  text: string;
  user: Types.ObjectId;
}
