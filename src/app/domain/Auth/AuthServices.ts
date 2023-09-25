import * as jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import PasswordValidator from 'password-validator';
import {Types} from 'mongoose';
import {BadRequestError, UnauthorizedError} from 'routing-controllers';

import {User} from 'models/user';
import {SignUpBody} from './AuthTypes';
import {customError} from 'customError/customError';

const {KEY} = process.env;
const schema = new PasswordValidator();

schema.is().min(6);

export default class AuthServices {
  async createNewUser(userData: SignUpBody) {
    const {name, surname, email, password} = userData;

    const existedUser = await User.findOne({email});

    if (existedUser) {
      throw new customError(409, 'Email already exists!');
    }

    try {
      if (!schema.validate(password)) {
        throw new BadRequestError('Password too short!');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await User.create({
        fullName: name + ' ' + surname,
        email,
        password: hashedPassword,
      });

      return await this.UserSignIn({email, password});
    } catch (e) {
      throw e;
    }
  }

  async UserSignIn(userData: Pick<SignUpBody, 'email' | 'password'>) {
    const {email, password} = userData;

    try {
      const userData = await User.findOne({email});

      if (!userData) throw new BadRequestError('User doesn`t exists!');

      const {_id, fullName, password: userPassword} = userData;

      const isCorrectPassword = await bcrypt.compare(password, userPassword);

      if (!isCorrectPassword)
        throw new UnauthorizedError('Incorrect password!');

      const accessToken = await this.createToken(_id);

      return {
        _id: _id.toString(),
        fullName,
        token: accessToken,
      };
    } catch (e) {
      throw e;
    }
  }

  async createToken(id: Types.ObjectId) {
    if (typeof KEY === 'string') {
      return jwt.sign({id}, KEY);
    } else {
      return 'KEY ERROR!';
    }
  }
}
