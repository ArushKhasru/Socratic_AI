import { Router } from 'express';
import { startChat, sendMessage, getChats, getChatById } from '../controllers/chatController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/start', startChat);
router.post('/message', sendMessage);
router.get('/', getChats);
router.get('/:id', getChatById);

export default router;
