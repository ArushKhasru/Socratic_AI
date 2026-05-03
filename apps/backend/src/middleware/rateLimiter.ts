import rateLimit from 'express-rate-limit';

export const messageRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "You're sending too fast. Please wait.",
  },
});
