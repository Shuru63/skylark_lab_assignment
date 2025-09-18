// src/utils/jwt.ts
import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'shubham_skylark_Shuru26';
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');

export type JwtPayload = {
  userId: string;
  username?: string;
  iat?: number;
  exp?: number;
};

// -------------------- Generate Token --------------------
export const generateToken = (
  payload: object,
  expiresIn: SignOptions['expiresIn'] = '7d'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, JWT_SECRET, { expiresIn }, (err, token) => {
      if (err || !token) return reject(err);
      resolve(token);
    });
  });
};

// -------------------- Verify Token --------------------
export const verifyToken = (token: string): Promise<JwtPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded as JwtPayload);
    });
  });
};
