import * as firebaseAdmin from 'firebase-admin';

export async function validateRequest(req): Promise<boolean> {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    console.log('Authorization header not provided.');
    return false;
  }

  const [bearer, token] = authHeader.split(' ');
  if (bearer !== 'Bearer' || !token) {
    console.log('Invalid authorization format. Expected "Bearer <token>".');
    return false;
  }

  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    console.log('Decoded Token:', decodedToken);
    return true;
  } catch (error) {
    if (error.code === 'auth/id-token-expired') {
      console.error('Token has expired.');
    } else if (error.code === 'auth/invalid-id-token') {
      console.error('Invalid ID token provided.');
    } else {
      console.error('Error verifying token:', error);
    }
    return false;
  }
}
