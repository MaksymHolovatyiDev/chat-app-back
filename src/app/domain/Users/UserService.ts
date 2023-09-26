import {User} from 'models/user';

export default class UserServices {
  async getAllUsers() {
    return await User.find().lean();
  }
}
