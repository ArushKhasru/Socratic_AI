import { randomBytes } from 'crypto';
import { CookieOptions, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { IUserDocument, UserModel } from '../models/User';
import { signToken } from '../utils/jwt';
import bcrypt from 'bcryptjs';

const AUTH_COOKIE_NAME = 'token';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const GOOGLE_SCOPES = ['openid', 'email', 'profile'];

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
    .map((clientId) => clientId.trim().replace(/^['"]+|['"]+$/g, ''))
    .filter(Boolean);

const getGoogleOAuthConfig = () => {
  const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim().replace(/^['"]+|['"]+$/g, '');
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim().replace(/^['"]+|['"]+$/g, '');
  const redirectUri = (process.env.GOOGLE_REDIRECT_URI || '').trim().replace(/^['"]+|['"]+$/g, '');

  if (!clientId || !clientSecret || !redirectUri) {
    return null;
  }

  try {
    new URL(redirectUri);
  } catch {
    return null;
  }

  return { clientId, clientSecret, redirectUri };
};

const createGoogleOAuthClient = () => {
  const config = getGoogleOAuthConfig();
  if (!config) return null;
  return new OAuth2Client(config.clientId, config.clientSecret, config.redirectUri);
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const getFrontendOrigin = () => {
  const fallback = 'http://localhost:3001';
  const configured = (process.env.FRONTEND_URL || '').trim();
  const candidate = configured || fallback;

  try {
    return new URL(candidate).origin;
  } catch {
    return fallback;
  }
};

const resolveFrontendUrl = (returnTo?: string) => {
  const frontendOrigin = getFrontendOrigin();
  const fallback = new URL('/dashboard', frontendOrigin).toString();

  if (!returnTo) {
    return fallback;
  }

  try {
    const target = new URL(returnTo, frontendOrigin);
    if (target.origin !== frontendOrigin) {
      return fallback;
    }
    return target.toString();
  } catch {
    return fallback;
  }
};

const encodeOAuthState = (returnTo: string) =>
  Buffer.from(JSON.stringify({ returnTo }), 'utf8').toString('base64url');

const decodeBase64Url = (input: string) => {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4 || 4)) % 4);
  return Buffer.from(padded, 'base64').toString('utf8');
};

const decodeOAuthState = (encodedState?: string) => {
  if (!encodedState) return undefined;

  try {
    const parsed = JSON.parse(decodeBase64Url(encodedState)) as {
      returnTo?: string;
    };
    return parsed.returnTo;
  } catch {
    return undefined;
  }
};

const withErrorParam = (urlString: string, error: string) => {
  const url = new URL(urlString);
  url.searchParams.set('error', error);
  return url.toString();
};

const readQueryString = (value: unknown) => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return undefined;
};

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

type GooglePayload = {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

const upsertGoogleUser = async (payload: GooglePayload) => {
  if (!payload.sub || !payload.email || !payload.email_verified) {
    return null;
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
    return user;
  }

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

  return user;
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

    const user = await upsertGoogleUser(payload || {});

    if (!user) {
      return res.status(401).json({ success: false, error: 'Unable to verify Google account' });
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

export const googleAuthStart = (req: Request, res: Response) => {
  const oauthClient = createGoogleOAuthClient();
  const signinUrl = resolveFrontendUrl('/signin');

  if (!oauthClient) {
    return res.redirect(withErrorParam(signinUrl, 'google_oauth_not_configured'));
  }

  const returnTo = readQueryString(req.query.returnTo);
  const safeReturnTo = resolveFrontendUrl(returnTo);

  try {
    const authUrl = oauthClient.generateAuthUrl({
      access_type: 'offline',
      scope: GOOGLE_SCOPES,
      include_granted_scopes: true,
      prompt: 'select_account',
      state: encodeOAuthState(safeReturnTo),
    });

    return res.redirect(authUrl);
  } catch {
    return res.redirect(withErrorParam(signinUrl, 'google_signin_failed'));
  }
};

export const googleCallback = async (req: Request, res: Response) => {
  const oauthClient = createGoogleOAuthClient();
  const signinUrl = resolveFrontendUrl('/signin');

  if (!oauthClient) {
    return res.redirect(withErrorParam(signinUrl, 'google_oauth_not_configured'));
  }

  const oauthError = readQueryString(req.query.error);
  const stateReturnTo = decodeOAuthState(readQueryString(req.query.state));
  const returnTo = resolveFrontendUrl(stateReturnTo);

  if (oauthError) {
    return res.redirect(withErrorParam(signinUrl, oauthError));
  }

  const code = readQueryString(req.query.code);
  if (!code) {
    return res.redirect(withErrorParam(signinUrl, 'google_code_missing'));
  }

  try {
    const { tokens } = await oauthClient.getToken(code);
    if (!tokens.id_token) {
      return res.redirect(withErrorParam(signinUrl, 'google_token_missing'));
    }

    const configuredAudience = getGoogleClientIds();
    const audience = configuredAudience.length
      ? configuredAudience
      : [process.env.GOOGLE_CLIENT_ID || ''];

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience,
    });

    const user = await upsertGoogleUser(ticket.getPayload() || {});
    if (!user) {
      return res.redirect(withErrorParam(signinUrl, 'google_account_unverified'));
    }

    setSessionCookie(res, user._id);
    return res.redirect(returnTo);
  } catch {
    return res.redirect(withErrorParam(signinUrl, 'google_signin_failed'));
  }
};

export const logout = (req: Request, res: Response) => {
  clearSessionCookie(res);
  res.json({ success: true, message: 'Logged out successfully' });
};

export const getMe = (req: Request, res: Response) => {
  res.json({ success: true, data: (req as any).user });
};
