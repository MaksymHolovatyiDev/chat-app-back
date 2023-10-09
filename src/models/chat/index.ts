import {Schema, model} from 'mongoose';
import {ChatSavedModel} from './types';

const chatSchema = new Schema<ChatSavedModel>(
  {
    users: [{type: Schema.Types.ObjectId, ref: 'User', required: true}],
    messages: [{type: Schema.Types.ObjectId, ref: 'Message', default: []}],
    chatName: {type: String, required: true},
  },

  {timestamps: true},
);

export const Chat = model<ChatSavedModel>('Chat', chatSchema);
