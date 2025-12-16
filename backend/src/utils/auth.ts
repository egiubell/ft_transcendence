import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const TOKEN_EXPIRY = '7d';

export interface AuthRequest extends Request {
  userId?: number;
  user?: {
    id: number;
    email: string;
    username: string;
  };
}

export function generateToken(userId: number, email: string, username: string): string {
  return jwt.sign(
    { userId, email, username },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

export function verifyToken(token: string): { userId: number; email: string; username: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      userId: decoded.userId,
      email: decoded.email,
      username: decoded.username
    };
  } catch (error) {
    return null;
  }
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(403).json({ error: 'Invalid or expired token' });
    return;
  }

  req.userId = decoded.userId;
  req.user = { id: decoded.userId, email: decoded.email, username: decoded.username };
  next();
}

export function refreshToken(req: AuthRequest, res: Response): void {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const newToken = generateToken(req.user.id, req.user.email, req.user.username);
  res.json({ token: newToken });
}
