import {Post, JsonController, HttpCode, Body} from 'routing-controllers';
import AuthServices from './AuthServices';
import {SignUpBody} from './AuthTypes';

@JsonController('/Auth')
export default class Auth {
  public service = new AuthServices();

  @HttpCode(201)
  @Post('/SignUp')
  async SignUp(@Body() body: SignUpBody) {
    return this.service.createNewUser(body);
  }

  @Post('/SignIn')
  async SignIn(@Body() body: Pick<SignUpBody, 'email' | 'password'>) {
    return this.service.UserSignIn(body);
  }
}
