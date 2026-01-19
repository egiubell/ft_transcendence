import express, { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../db/connection';
import { validateEmail, validatePassword, validateUsername } from '../utils/validation';
import { generateToken, authenticateToken, AuthRequest } from '../utils/auth';
import { OAuth2Client } from 'google-auth-library';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || '';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

function getGoogleClient() {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) return null;
  return new OAuth2Client({
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    redirectUri: GOOGLE_REDIRECT_URI
  });
}

const router = Router();

// Google OAuth: return authorization URL
router.get('/google/url', (req: Request, res: Response) => {
  const client = getGoogleClient();
  if (!client) {
    return res.status(500).json({ error: 'Google OAuth not configured' });
  }

  const url = client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['openid', 'email', 'profile']
  });

  res.json({ url });
});

// Google OAuth callback
router.get('/google/callback', async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const client = getGoogleClient();

  if (!client) {
    return res.status(500).json({ error: 'Google OAuth not configured' });
  }

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  try {
    const { tokens } = await client.getToken(code);
    if (!tokens.id_token) {
      return res.status(400).json({ error: 'Missing ID token from Google' });
    }

    const ticket = await client.verifyIdToken({ idToken: tokens.id_token, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Invalid Google token payload' });
    }

    const googleId = payload.sub;
    const email = payload.email;
    const displayName = payload.name || email.split('@')[0];
    const avatarUrl = payload.picture || null;

    // Find existing user by google_id or email
    const existingByGoogle = await pool.query('SELECT id, email, username FROM users WHERE google_id = $1', [googleId]);
    let user = existingByGoogle.rows[0];

    if (!user) {
      const existingByEmail = await pool.query('SELECT id, email, username FROM users WHERE email = $1', [email]);
      user = existingByEmail.rows[0];
    }

    if (user) {
      // Attach google_id if missing
      await pool.query('UPDATE users SET google_id = COALESCE(google_id, $1), avatar_url = COALESCE($2, avatar_url), updated_at = NOW() WHERE id = $3', [googleId, avatarUrl, user.id]);
      const refreshed = await pool.query('SELECT id, email, username FROM users WHERE id = $1', [user.id]);
      user = refreshed.rows[0];
    } else {
      // Generate a unique username based on Google profile
      const baseUsername = displayName.replace(/[^a-zA-Z0-9_-]/g, '') || email.split('@')[0];
      let candidate = baseUsername.slice(0, 20) || 'user';
      let suffix = 1;
      // Ensure username uniqueness
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const exists = await pool.query('SELECT 1 FROM users WHERE username = $1', [candidate]);
        if (exists.rowCount === 0) break;
        candidate = `${baseUsername.slice(0, 16)}${suffix}`;
        suffix += 1;
        if (suffix > 9999) {
          candidate = `${baseUsername.slice(0, 12)}${Date.now()}`;
          break;
        }
      }

      // Google users do not need a local password, store a placeholder hash
      const placeholderPassword = await bcrypt.hash(`google-${googleId}-${Date.now()}`, 10);

      const created = await pool.query(
        'INSERT INTO users (email, username, password_hash, google_id, avatar_url) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, username',
        [email, candidate, placeholderPassword, googleId, avatarUrl]
      );
      user = created.rows[0];

      // Initialize stats row
      await pool.query('INSERT INTO game_stats (user_id) VALUES ($1)', [user.id]);
    }

    const appToken = generateToken(user.id, user.email, user.username);
    const userPayload = Buffer.from(JSON.stringify(user)).toString('base64');
    const redirectTarget = `${FRONTEND_URL}/#google_token=${encodeURIComponent(appToken)}&google_user=${encodeURIComponent(userPayload)}`;

    return res.redirect(302, redirectTarget);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return res.status(500).json({ error: 'Google OAuth failed' });
  }
});

// Signup endpoint
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;

    // Validation
    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username, and password are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!validateUsername(username)) {
      return res.status(400).json({ error: 'Invalid username. Use 3-20 chars, start with a letter, only letters, numbers, _ or -' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Weak password. Min 8 chars, include upper, lower and a digit' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email or username already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id, email, username',
      [email, username, passwordHash]
    );

    const user = result.rows[0];

    // Create stats record
    await pool.query(
      'INSERT INTO game_stats (user_id) VALUES ($1)',
      [user.id]
    );

    // Generate JWT token
    const token = generateToken(user.id, user.email, user.username);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const result = await pool.query(
      'SELECT id, email, username, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email, user.username);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify token endpoint
router.get('/verify', authenticateToken as any, (req: AuthRequest, res: Response) => {
  res.json({
    valid: true,
    user: req.user
  });
});

export default router;
