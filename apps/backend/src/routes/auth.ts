import { Router } from 'express';
import { signup, signin, googleSignin, googleAuthStart, googleCallback, logout, getMe } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/google', googleSignin);
router.get('/google/start', googleAuthStart);
router.get('/callback', googleCallback);
// Backward-compatible alias for misconfigured redirect URIs like /auth/auth/callback.
router.get('/auth/callback', googleCallback);
router.post('/logout', logout);
router.get('/me', authMiddleware, getMe);

export default router;
