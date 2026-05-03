import { randomBytes } from 'crypto';
import { CookieOptions, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { IUserDocument, UserModel } from '../models/User';
import { signToken } from '../utils/jwt';
import bcrypt from 'bcrypt';

const AUTH_COOKIE_NAME = 'token';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const googleClient = new OAuth2Client();

const getAuthCookieOptions = (): CookieOptions => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: SESSION_MAX_AGE,
  };
};

const getGoogleClientIds = () =>
  (process.env.GOOGLE_CLIENT_IDS || process.env.GOOGLE_CLIENT_ID || '')
    .split(',')
    .map((clientId) => clientId.trim())
    .filter(Boolean);

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const serializeUser = (user: IUserDocument) => ({
  _id: user._id,
  id: user._id,
  name: user.name,
  email: user.email,
  avatarUrl: user.avatarUrl,
  subjects: user.subjects,
  notificationsEnabled: user.notificationsEnabled,
});

const setSessionCookie = (res: Response, userId: unknown) => {
  const token = signToken({ id: userId });
  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
};

const clearSessionCookie = (res: Response) => {
  const options = getAuthCookieOptions();
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: options.httpOnly,
    secure: options.secure,
    sameSite: options.sameSite,
  });
};

export const signup = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const normalizedEmail = normalizeEmail(email || '');

  try {
    const userExists = await UserModel.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const user = await UserModel.create({ name, email: normalizedEmail, password });
    setSessionCookie(res, user._id);

    res.status(201).json({
      success: true,
      data: serializeUser(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error during signup' });
  }
};

export const signin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const normalizedEmail = normalizeEmail(email || '');

  try {
    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    setSessionCookie(res, user._id);

    res.json({
      success: true,
      data: serializeUser(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error during signin' });
  }
};

export const googleSignin = async (req: Request, res: Response) => {
  const { credential } = req.body;
  const audience = getGoogleClientIds();

  if (!credential || typeof credential !== 'string') {
    return res.status(400).json({ success: false, error: 'Google credential is required' });
  }

  if (audience.length === 0) {
    return res.status(500).json({ success: false, error: 'Google OAuth is not configured' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience,
    });
    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email || !payload.email_verified) {
      return res.status(401).json({ success: false, error: 'Unable to verify Google account' });
    }

    const email = normalizeEmail(payload.email);
    let user = await UserModel.findOne({
      $or: [{ googleId: payload.sub }, { email }],
    });

    if (!user) {
      user = await UserModel.create({
        name: payload.name || email.split('@')[0],
        email,
        password: randomBytes(32).toString('hex'),
        googleId: payload.sub,
        avatarUrl: payload.picture,
      });
    } else {
      let shouldSave = false;

      if (!user.googleId) {
        user.googleId = payload.sub;
        shouldSave = true;
      }

      if (payload.picture && user.avatarUrl !== payload.picture) {
        user.avatarUrl = payload.picture;
        shouldSave = true;
      }

      if (shouldSave) {
        await user.save();
      }
    }

    setSessionCookie(res, user._id);

    res.json({
      success: true,
      data: serializeUser(user),
    });
  } catch (error) {
    res.status(401).json({ success: false, error: 'Google sign-in failed' });
  }
};

export const logout = (req: Request, res: Response) => {
  clearSessionCookie(res);
  res.json({ success: true, message: 'Logged out successfully' });
};

export const getMe = (req: Request, res: Response) => {
  res.json({ success: true, data: (req as any).user });
};
