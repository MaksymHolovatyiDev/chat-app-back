import {User} from 'models/user';

export default class UserServices {
  async getAllUsers() {
    return await User.find()
      .lean()
      .select({
        _id: {$toString: '$_id'},
        fullName: 1,
        socketId: 1,
        updatedAt: 1,
      });
  }
}
