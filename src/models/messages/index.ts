import {Schema, model} from 'mongoose';
import {MessagesSavedModel} from './types';

const messagesSchema = new Schema<MessagesSavedModel>(
  {
    text: {type: String, required: true},
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  },

  {timestamps: true},
);

export const Messages = model<MessagesSavedModel>('Message', messagesSchema);
