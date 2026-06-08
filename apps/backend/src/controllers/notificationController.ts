import { Request, Response } from 'express';
import { UserModel } from '../models/User';

export const registerToken = async (req: Request, res: Response) => {
  const { token } = req.body;
  const userId = (req as any).user._id;

  try {
    await UserModel.findByIdAndUpdate(userId, {
      $addToSet: { deviceTokens: token }
    });
    res.json({ success: true, message: 'Push token registered' });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to register token' });
  }
};

export const unregisterToken = async (req: Request, res: Response) => {
  const { token } = req.body;
  const userId = (req as any).user._id;

  try {
    await UserModel.findByIdAndUpdate(userId, {
      $pull: { deviceTokens: token }
    });
    res.json({ success: true, message: 'Push token removed' });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to unregister token' });
  }
};

export const updatePreferences = async (req: Request, res: Response) => {
  const { enabled } = req.body;
  const userId = (req as any).user._id;

  try {
    await UserModel.findByIdAndUpdate(userId, {
      notificationsEnabled: enabled
    });
    res.json({ success: true, message: 'Preferences updated' });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to update preferences' });
  }
};
