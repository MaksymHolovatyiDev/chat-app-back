import {Schema, model} from 'mongoose';
import {UserSavedModel} from 'types/models/user';

const userSchema = new Schema<UserSavedModel>(
  {
    name: {type: String, required: true},
    surname: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
  },

  {timestamps: true},
);

export const User = model<UserSavedModel>('User', userSchema);
