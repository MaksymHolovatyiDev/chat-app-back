import {Post, JsonController, HttpCode, Body, Req} from 'routing-controllers';
import AuthServices from './AuthServices';
import {SignUpBody} from './AuthTypes';

@JsonController('/Auth')
export default class Auth {
  public service = new AuthServices();

  @HttpCode(201)
  @Post('/SignUp')
  async SignUp(@Req() Req: unknown, @Body() body: SignUpBody) {
    return this.service.createNewUser(Req, body);
  }

  @Post('/SignIn')
  async SignIn(
    @Req() Req: unknown,
    @Body() body: Pick<SignUpBody, 'email' | 'password'>,
  ) {
    return this.service.UserSignIn(Req, body);
  }
}
