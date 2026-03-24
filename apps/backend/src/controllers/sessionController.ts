import { Request, Response } from 'express';
import { SessionModel } from '../models/Session';

export const createSession = async (req: Request, res: Response) => {
  const { subject } = req.body;
  const userId = (req as any).user._id;

  try {
    // End existing active session for this subject
    await SessionModel.updateMany({ userId, subject, isActive: true }, { isActive: false, endedAt: new Date() });

    const session = await SessionModel.create({
      userId,
      subject,
      messages: [],
    });

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create session' });
  }
};

export const getSessions = async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const { subject } = req.query;

  try {
    const filter: any = { userId };
    if (subject) filter.subject = subject;

    const sessions = await SessionModel.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch sessions' });
  }
};

export const getSessionById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user._id;

  try {
    const session = await SessionModel.findOne({ _id: id, userId });
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch session' });
  }
};

export const endSession = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user._id;

  try {
    const session = await SessionModel.findOne({ _id: id, userId });
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    const endedAt = new Date();
    const duration = Math.round((endedAt.getTime() - session.startedAt.getTime()) / 1000);

    session.isActive = false;
    session.endedAt = endedAt;
    session.duration = duration;
    session.topic = session.subject;

    await session.save();
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to end session' });
  }
};
