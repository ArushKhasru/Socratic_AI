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

// Normalize origin helper
const normalizeOrigin = (origin: string) => origin.trim().replace(/\/+$/, '');

const configuredOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
]
  .filter((o): o is string => Boolean(o))
  .map(normalizeOrigin);

const allowedOrigins = new Set<string>([
  'http://localhost:3000',
  'http://localhost:3001',
  ...configuredOrigins,
]);

// ✅ CORS — must be first
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.has(normalizeOrigin(origin))) return callback(null, true);
    console.warn('Blocked by CORS:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// ✅ Fix Google OAuth popup postMessage blocking
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});

// Body parsing
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/user', userRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Socratic AI API is running' });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;