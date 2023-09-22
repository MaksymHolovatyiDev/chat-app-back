import {verify} from 'jsonwebtoken';
import {
  ExpressMiddlewareInterface,
  ForbiddenError,
  UnauthorizedError,
} from 'routing-controllers';

import {User} from 'models/user';

const {KEY} = process.env;

export default function authenticationMiddleware() {
  return class authenticationMiddlewareClass
    implements ExpressMiddlewareInterface
  {
    async use(request: any, _: any, next: any): Promise<any> {
      const token = request.headers['authorization'];
      const [bearer, accessToken] = token.split(' ');

      if (!token || bearer != 'Bearer' || !accessToken) {
        throw new UnauthorizedError('Missing token!');
      }

      try {
        if (typeof KEY !== 'string') throw new Error('KEY Error!');

        const data: any = verify(accessToken, KEY);

        const user = await User.findById(data?.id);

        if (!user) {
          throw new Error('User not found!');
        }

        request.userTokenId = data?.id;

        next();
      } catch (e) {
        console.log(e);
        throw new ForbiddenError('Access denied!');
      }
    }
  };
}
