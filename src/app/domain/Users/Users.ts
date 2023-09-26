import authenticationMiddleware from 'middlewares/authenticationMiddleware';
import {JsonController, UseBefore, Get} from 'routing-controllers';
import UserServices from './UserService';

@JsonController('/Users')
export default class Users {
  public service = new UserServices();

  @Get()
  @UseBefore(authenticationMiddleware())
  async getAllUsers() {
    return this.service.getAllUsers();
  }
}
