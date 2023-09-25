import {Schema, model} from 'mongoose';
import {UserSavedModel} from './types';

const userSchema = new Schema<UserSavedModel>(
  {
    fullName: {type: String, required: true},
    socketId: {type: Schema.Types.Mixed, default: null},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    chats: [{type: Schema.Types.ObjectId, ref: 'Chat', default: []}],
  },

  {timestamps: true},
);

export const User = model<UserSavedModel>('User', userSchema);
