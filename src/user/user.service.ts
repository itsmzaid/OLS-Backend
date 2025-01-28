import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import * as firebaseAdmin from 'firebase-admin';
import { LoginDto } from './dto/login.dto';
import { sendPostRequest } from '../utils/http.utils';
import { validateRequest } from '../utils/auth.utils';

@Injectable()
export class UserService {
  private readonly apiKey = process.env.APIKEY;

  async registerUser(registerUser: RegisterUserDto) {
    try {
      const userRecord = await firebaseAdmin.auth().createUser({
        displayName: registerUser.name,
        email: registerUser.email,
        password: registerUser.password,
        phoneNumber: registerUser.phoneNo,
      });
      return { message: 'User registered successfully', user: userRecord };
    } catch (error: any) {
      if (error.errorInfo) {
        const { code } = error.errorInfo;
        if (code === 'auth/email-already-exists') {
          throw new HttpException(
            'The email address is already in use by another account.',
            HttpStatus.BAD_REQUEST,
          );
        }
        if (code === 'auth/phone-number-already-exists') {
          throw new HttpException(
            'The phone number is already in use by another account.',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
      throw new HttpException(
        'User registration failed. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async loginUser(payload: LoginDto) {
    const { email, password } = payload;
    try {
      const { idToken, refreshToken, expiresIn } =
        await this.signInWithEmailAndPassword(email, password);

      return { idToken, refreshToken, expiresIn };
    } catch (error: any) {
      if (error.response && error.response.data) {
        const errorCode = error.response.data.error.message;

        if (errorCode === 'EMAIL_NOT_FOUND') {
          throw new HttpException(
            'This email is not registered. Please sign up.',
            HttpStatus.NOT_FOUND,
          );
        }

        if (errorCode === 'INVALID_PASSWORD') {
          throw new HttpException(
            'Incorrect password. Please try again.',
            HttpStatus.UNAUTHORIZED,
          );
        }

        if (errorCode === 'TOO_MANY_ATTEMPTS_TRY_LATER') {
          throw new HttpException(
            'Too many failed login attempts. Please try again later.',
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }
      }

      throw new HttpException(
        'Login failed. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async signInWithEmailAndPassword(email: string, password: string) {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.apiKey}`;
    return await sendPostRequest(url, {
      email,
      password,
      returnSecureToken: true,
    });
  }

  async validateRequest(req): Promise<boolean> {
    return validateRequest(req);
  }

  async refreshAuthToken(refreshToken: string) {
    try {
      const {
        id_token: idToken,
        refresh_token: newRefreshToken,
        expires_in: expiresIn,
      } = await this.sendRefreshAuthTokenRequest(refreshToken);
      return {
        idToken,
        refreshToken: newRefreshToken,
        expiresIn,
      };
    } catch (error: any) {
      if (error.message.includes('INVALID_REFRESH_TOKEN')) {
        throw new Error(`Invalid refresh token: ${refreshToken}.`);
      } else {
        throw new Error('Failed to refresh token');
      }
    }
  }

  private async sendRefreshAuthTokenRequest(refreshToken: string) {
    const url = `https://securetoken.googleapis.com/v1/token?key=${this.apiKey}`;
    const payload = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    };
    return await sendPostRequest(url, payload);
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
