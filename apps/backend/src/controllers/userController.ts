import { Request, Response } from 'express';
import { ChatModel } from '../models/Chat';
import { UserModel } from '../models/User';

export const getUserStats = async (req: Request, res: Response) => {
  const userId = (req as any).user._id;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const chats = await ChatModel.find({ userId });
    
    const totalSessions = chats.length;
    
    // Logic to calculate hours learned
    // For each chat, we'll estimate duration as (last message time - first message time)
    let totalDurationMs = 0;
    chats.forEach(chat => {
      if (chat.messages.length > 1) {
        const firstMsg = chat.messages[0];
        const lastMsg = chat.messages[chat.messages.length - 1];
        totalDurationMs += (lastMsg.timestamp.getTime() - firstMsg.timestamp.getTime());
      }
    });

    const hoursLearned = (totalDurationMs / (1000 * 60 * 60)).toFixed(1);

    // Subject Mastery logic (mock for now based on number of chats)
    const subjectMastery = [
      { subject: 'Physics', icon: '⚛️', count: 0 },
      { subject: 'Mathematics', icon: '📐', count: 0 },
      { subject: 'Chemistry', icon: '🧪', count: 0 },
      { subject: 'Biology', icon: '🌿', count: 0 },
    ];

    chats.forEach(chat => {
      const entry = subjectMastery.find(sm => sm.subject === chat.subject || sm.subject.toLowerCase() === chat.subject.toLowerCase());
      if (entry) entry.count += 1;
    });

    // Level calculation (simple example: 10 chats = 100% mastery)
    const masteryData = subjectMastery.map(sm => ({
      subject: sm.subject,
      icon: sm.icon,
      level: Math.min(100, Math.floor((sm.count * 10))), // 10% per chat session
      sessions: sm.count
    }));

    // Weekly Engagement logic
    const weeklyActivity = [
      { day: 'Mon', count: 0 },
      { day: 'Tue', count: 0 },
      { day: 'Wed', count: 0 },
      { day: 'Thu', count: 0 },
      { day: 'Fri', count: 0 },
      { day: 'Sat', count: 0 },
      { day: 'Sun', count: 0 },
    ];

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    chats.forEach(chat => {
      if (chat.updatedAt >= oneWeekAgo) {
        const dayIndex = (new Date(chat.updatedAt).getDay() + 6) % 7; // Convert to 0=Mon, 6=Sun
        weeklyActivity[dayIndex].count += 1;
      }
    });

    // Subject Distribution for Pie Chart
    const totalSubjectMessages = chats.reduce((acc, c) => acc + c.messages.length, 0);
    const subjectDistribution = subjectMastery.map(sm => ({
      subject: sm.subject,
      percentage: totalSubjectMessages > 0 
        ? Math.round((chats.filter(c => c.subject.toLowerCase() === sm.subject.toLowerCase()).reduce((acc, c) => acc + c.messages.length, 0) / totalSubjectMessages) * 100)
        : 0
    }));

    res.json({
      success: true,
      data: {
        totalSessions,
        hoursLearned: parseFloat(hoursLearned),
        streak: user.streak || 0,
        masteryData,
        weeklyActivity,
        subjectDistribution,
        averageMastery: masteryData.length > 0 ? Math.round(masteryData.reduce((acc, m) => acc + m.level, 0) / masteryData.length) : 0,
        lastActivityAt: user.lastActivityAt,
        recentTimeline: chats.slice(0, 5).map(c => ({
          subject: c.subject,
          updatedAt: c.updatedAt,
          messageCount: c.messages.length
        }))
      }
    });
  } catch (error) {
    console.error('STATS_ERROR:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user stats' });
  }
};

export const updateUserSubjects = async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const { subjects } = req.body;

  if (!Array.isArray(subjects)) {
    return res.status(400).json({ success: false, error: 'Invalid subjects format' });
  }

  try {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { subjects } },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update user subjects' });
  }
};

// Search for users by name
export const searchUsers = async (req: Request, res: Response) => {
  const { name } = req.query;
  const userId = (req as any).user._id;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ success: false, error: 'Name query is required' });
  }

  try {
    const users = await UserModel.find({
      name: { $regex: name, $options: 'i' },
      _id: { $ne: userId }
    }).select('name _id').limit(10);
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to search users' });
  }
};
