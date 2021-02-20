import { hash, verify } from 'argon2';
import { validate } from 'class-validator';
import {
  Arg,
  Args,
  ArgsType,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from '../constants';
import { User } from '../entities/User';
import { MyContext } from '../MyContext';
import { FieldError } from '../types';
import { extractErrors } from '../utils/extractErrors';
import { sendEmail } from '../utils/sendEmail';
import { v4 as uuid } from 'uuid';

@ArgsType()
class RegisterArgs {
  @Field()
  email: string;

  @Field()
  username: string;

  @Field()
  password: string;
}

@ArgsType()
class LoginArgs {
  @Field()
  usernameOrEmail: string;
  @Field()
  password: string;
}

@ObjectType()
class UserResponse {
  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}

@Resolver()
export class UserResovler {
  // Get current logged in user

  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    return User.findOne({ where: { id: req.session.userId } });
  }

  // Register

  @Mutation(() => UserResponse)
  async register(
    @Args() { email, username, password }: RegisterArgs
  ): Promise<UserResponse> {
    try {
      const user = new User({ email, username, password });
      const validationErrors = await validate(user);
      if (validationErrors.length > 0) {
        return { errors: extractErrors(validationErrors) };
      }
      await user.save();
      return { user };
    } catch (err) {
      let errors: FieldError[] = [];
      console.log(err);
      if (err.code === '23505') {
        if (err.detail.includes('email')) {
          errors.push({ field: 'email', message: 'Email is already taken' });
        }
        if (err.detail.includes('username')) {
          errors.push({
            field: 'username',
            message: 'Username is already taken',
          });
        }
        return { errors };
      }
    }
    return {};
  }

  // Login

  @Mutation(() => UserResponse)
  async login(
    @Args() { usernameOrEmail, password }: LoginArgs,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    try {
      const user = await User.findOne({
        where: usernameOrEmail.includes('@')
          ? { email: usernameOrEmail }
          : { username: usernameOrEmail },
      });
      if (!user) {
        return {
          errors: [
            {
              field: 'usernameOrEmail',
              message: 'User does not exist, register to continue',
            },
          ],
        };
      }
      const valid = await verify(user?.password, password);
      if (!valid) {
        return {
          errors: [{ field: 'password', message: 'Incorrect Password' }],
        };
      }
      req.session.userId = user.id;
      return { user };
    } catch (err) {
      console.log(err);
    }
    return {};
  }

  // Logout
  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: MyContext): Promise<boolean> {
    return new Promise((resolve) => {
      req.session.destroy((err) => {
        if (err) {
          console.log(err);
          resolve(false);
        }
        res.clearCookie(COOKIE_NAME);
        resolve(true);
      });
    });
  }

  // Forgot Password

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user = await User.findOne({ email });
    if (!user) return true;
    try {
      const token = uuid();
      await redis.set(
        FORGOT_PASSWORD_PREFIX + token,
        user.id,
        'ex',
        1000 * 60 * 60 * 3 // 3 hours
      );
      const html = `<a href="http://localhost:3000/change-password/${token}">Reset Password</a>`;
      await sendEmail(email, html);
      return true;
    } catch (err) {
      console.log(err);
    }
    return false;
  }

  // Change Password
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length < 6) {
      return {
        errors: [
          {
            field: 'newPassword',
            message: 'Password must be 6 or more characters long',
          },
        ],
      };
    }
    const userId = await redis.get(FORGOT_PASSWORD_PREFIX + token);
    if (!userId)
      return { errors: [{ field: 'token', message: 'Token expired' }] };

    const user = await User.findOne(userId);
    if (!user)
      return { errors: [{ field: 'token', message: 'Token expired' }] };
    user.password = await hash(newPassword);
    await user.save();
    // Delete token from redis
    await redis.del(FORGOT_PASSWORD_PREFIX + token);
    // login user after password reset
    req.session.userId = user.id;
    return { user };
  }
}
