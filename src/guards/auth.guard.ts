import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      console.log('No Authorization Header Found'); // Debug
      return false;
    }

    const token = authHeader.split(' ')[1]; // Extract token
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      console.log('Decoded Token:', decodedToken); // ✅ Debugging
      request.user = decodedToken;
      return true;
    } catch (error) {
      console.log('Token Verification Failed:', error); // Debugging
      return false;
    }
  }
}
