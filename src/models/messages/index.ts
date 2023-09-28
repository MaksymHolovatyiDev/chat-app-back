import {Schema, model} from 'mongoose';
import {MessagesSavedModel} from './types';

const messagesSchema = new Schema<MessagesSavedModel>(
  {
    text: {type: String, required: true},
    chatUsers: [{type: Schema.Types.ObjectId, ref: 'User', required: true}],
    owner: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    chatId: {type: Schema.Types.ObjectId, ref: 'Chat', required: true},
    delivered: {type: Boolean, require: true, default: false},
    read: {type: Boolean, require: true, default: false},
  },

  {timestamps: true},
);

export const Messages = model<MessagesSavedModel>('Message', messagesSchema);
