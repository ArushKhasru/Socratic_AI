import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/auth';
import sessionRoutes from './routes/sessions';
import chatRoutes from './routes/chat';
import userRoutes from './routes/user';
import notificationRoutes from './routes/notifications';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

const stripWrappingQuotes = (value: string) =>
  value.trim().replace(/^['"]+|['"]+$/g, '');

// Normalize origin helper
const normalizeOrigin = (origin: string) => {
  const cleaned = stripWrappingQuotes(origin);
  if (!cleaned) return '';

  try {
    return new URL(cleaned).origin.toLowerCase();
  } catch {
    return cleaned.toLowerCase().replace(/\/+$/, '');
  }
};

const defaultDevOrigins =
  process.env.NODE_ENV === 'production'
    ? []
    : ['http://localhost:3000', 'http://localhost:3001'];

const configuredOrigins = [
  ...defaultDevOrigins,
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
]
  .filter((o): o is string => Boolean(o))
  .map(normalizeOrigin);

const allowedOrigins = new Set<string>(configuredOrigins.filter((origin) => !origin.includes('*')));
const wildcardOriginPatterns = configuredOrigins
  .filter((origin) => origin.includes('*'))
  .map((origin) =>
    new RegExp(`^${origin.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`)
  );

if (allowedOrigins.size || wildcardOriginPatterns.length) {
  console.log('CORS allowlist configured:', [
    ...Array.from(allowedOrigins.values()),
    ...configuredOrigins.filter((origin) => origin.includes('*')),
  ]);
}

const isAllowedOrigin = (origin: string) => {
  const normalizedOrigin = normalizeOrigin(origin);
  if (allowedOrigins.has(normalizedOrigin)) return true;
  return wildcardOriginPatterns.some((pattern) => pattern.test(normalizedOrigin));
};

// ✅ CORS — must be first
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (isAllowedOrigin(origin)) return callback(null, true);
    console.warn('Blocked by CORS:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// ✅ Fix Google OAuth popup postMessage blocking
app.use((_req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});

// Body parsing
app.use(express.json());
app.use(cookieParser());

const mountRoutes = (prefix = '') => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/sessions`, sessionRoutes);
  app.use(`${prefix}/chat`, chatRoutes);
  app.use(`${prefix}/user`, userRoutes);
  app.use(`${prefix}/notifications`, notificationRoutes);
};

// Support both /api/* and /* route prefixes for different deployment rewrites.
mountRoutes('/api');
mountRoutes('');

// Health check
const healthHandler = (_req: express.Request, res: express.Response) => {
  res.json({ status: 'OK', message: 'Socratic AI API is running' });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// Error handling
app.use(errorHandler);

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
