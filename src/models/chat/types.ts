import { Types } from "mongoose";

export interface ChatSavedModel {
  users: [Types.ObjectId, Types.ObjectId];
  messages: Types.ObjectId[];
}
