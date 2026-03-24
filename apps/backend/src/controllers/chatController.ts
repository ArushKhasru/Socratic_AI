import { Request, Response } from 'express';
import { ChatModel } from '../models/Chat';
import { UserModel } from '../models/User';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

// Start or resume a chat for a subject
export const startChat = async (req: Request, res: Response) => {
  const { subject, forceNew } = req.body;
  const userId = (req as any).user._id;

  try {
    if (forceNew) {
      await ChatModel.updateMany(
        { userId, subject, isActive: true },
        { $set: { isActive: false } }
      );
    }

    // Check for an existing active chat for this subject
    let chat = await ChatModel.findOne({ userId, subject, isActive: true });

    if (!chat) {
      chat = await ChatModel.create({
        userId,
        subject,
        messages: [],
      });
    }

    res.status(201).json({ success: true, data: chat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to start chat' });
  }
};

// Send a message and get Socratic AI response
export const sendMessage = async (req: Request, res: Response) => {
  const { chatId, content } = req.body;
  const userId = (req as any).user._id;

  try {
    if (!chatId || typeof chatId !== 'string') {
      return res.status(400).json({ success: false, error: 'Valid chatId is required' });
    }

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Message content is required' });
    }

    const chat = await ChatModel.findOne({ _id: chatId, userId, isActive: true });
    if (!chat) {
      return res.status(404).json({ success: false, error: 'Active chat not found' });
    }

    // Add user message
    const trimmedContent = content.trim();
    const userMessage = { role: 'user' as const, content: trimmedContent, timestamp: new Date() };
    chat.messages.push(userMessage);

    // Build history for Python service
    const history = chat.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Call Python FastAPI service
    const pythonResponse = await fetch(`${PYTHON_SERVICE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: chat.subject,
        history: history.slice(0, -1), // send history without the current message
        message: trimmedContent,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!pythonResponse.ok) {
      const errorBody = await pythonResponse.text();
      let pythonDetail = errorBody;

      try {
        const parsedError = JSON.parse(errorBody);
        pythonDetail =
          parsedError?.detail ||
          parsedError?.error ||
          errorBody;
      } catch {
        pythonDetail = errorBody;
      }

      return res.status(pythonResponse.status).json({
        success: false,
        error: 'Tutor service is unavailable',
        details: `Python service returned ${pythonResponse.status}${pythonDetail ? `: ${pythonDetail}` : ''}`,
      });
    }

    const aiData = await pythonResponse.json();

    // Add AI response message
    const aiMessage = {
      role: 'assistant' as const,
      content: aiData.reply,
      timestamp: new Date(),
    };
    chat.messages.push(aiMessage);

    await chat.save();
    
    // Auto-generate topic if missing
    if (!chat.topic && !aiData.isIrrelevant) {
      try {
        const topicResponse = await fetch(`${PYTHON_SERVICE_URL}/generate-topic`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: trimmedContent }),
        });
        if (topicResponse.ok) {
          const { topic } = await topicResponse.json();
          chat.topic = topic;
          await chat.save();
        }
      } catch (topicError) {
        console.error('TOPIC_GEN_ERROR:', topicError);
      }
    }

    // Update streak logic
    try {
      const user = await UserModel.findById(userId);
      if (user) {
        const now = new Date();
        const lastActivity = user.lastActivityAt;
        
        if (!lastActivity) {
          user.streak = 1;
        } else {
          const diffInMs = now.getTime() - lastActivity.getTime();
          const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
          
          const lastActivityDate = new Date(lastActivity).setHours(0,0,0,0);
          const nowDate = new Date(now).setHours(0,0,0,0);
          const daysBetween = (nowDate - lastActivityDate) / (1000 * 60 * 60 * 24);

          if (daysBetween === 1) {
            user.streak += 1;
          } else if (daysBetween > 1) {
            user.streak = 1;
          }
          // if daysBetween === 0, streak remains same
        }
        user.lastActivityAt = now;
        await user.save();
      }
    } catch (streakError) {
      console.error('STREAK_UPDATE_ERROR:', streakError);
    }

    res.json({
      success: true,
      data: {
        ...aiMessage,
        isIrrelevant: aiData.isIrrelevant,
      },
    });
  } catch (error: any) {
    console.error('CHAT_ERROR:', error.message);

    const isPythonUnavailable =
      error?.name === 'TimeoutError' ||
      error?.name === 'AbortError' ||
      error?.cause?.code === 'ECONNREFUSED' ||
      error?.cause?.code === 'ECONNRESET' ||
      error?.cause?.code === 'ENOTFOUND' ||
      /fetch failed/i.test(error?.message || '');

    res.status(isPythonUnavailable ? 503 : 500).json({
      success: false,
      error: 'Failed to process message',
      details: isPythonUnavailable
        ? `Tutor service is unavailable at ${PYTHON_SERVICE_URL}. Start the FastAPI service and try again.`
        : error.message,
    });
  }
};

// Get all chats for the current user (owned or shared)
export const getChats = async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const { subject } = req.query;

  try {
    const filter: any = {
      $or: [
        { userId },
        { 'collaborators.userId': userId }
      ]
    };
    if (subject) filter.subject = subject;

    const chats = await ChatModel.find(filter).sort({ updatedAt: -1 });
    res.json({ success: true, data: chats });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch chats' });
  }
};

// Get a single chat by ID
export const getChatById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user._id;

  try {
    const chat = await ChatModel.findOne({
      _id: id,
      $or: [{ userId }, { 'collaborators.userId': userId }]
    });
    if (!chat) {
      return res.status(404).json({ success: false, error: 'Chat not found or access denied' });
    }
    res.json({ success: true, data: chat });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch chat' });
  }
};

// Delete a chat by ID
export const deleteChat = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user._id;

  try {
    const chat = await ChatModel.findOneAndDelete({ _id: id, userId });
    if (!chat) {
      return res.status(404).json({ success: false, error: 'Chat not found' });
    }
    res.json({ success: true, message: 'Chat deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete chat' });
  }
};

// Update chat topic
export const updateChatTopic = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { topic } = req.body;
  const userId = (req as any).user._id;

  try {
    const chat = await ChatModel.findOneAndUpdate(
      { 
        _id: id, 
        $or: [{ userId }, { collaborators: { $elemMatch: { userId, access: 'write' } } }]
      },
      { $set: { topic } },
      { new: true }
    );
    if (!chat) {
      return res.status(404).json({ success: false, error: 'Chat not found or permission denied' });
    }
    res.json({ success: true, data: chat });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update chat topic' });
  }
};

// Share a chat with another user
export const shareChat = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { targetUserId, access = 'read' } = req.body;
  const userId = (req as any).user._id;

  try {
    const chat = await ChatModel.findOne({ _id: id, userId });
    if (!chat) {
      return res.status(404).json({ success: false, error: 'Chat not found' });
    }

    // Check if already shared
    const isAlreadyShared = chat.collaborators.some(c => c.userId.toString() === targetUserId);
    if (isAlreadyShared) {
      return res.status(400).json({ success: false, error: 'Chat already shared with this user' });
    }

    chat.collaborators.push({ userId: targetUserId as any, access });
    await chat.save();

    res.json({ success: true, message: 'Chat shared successfully', data: chat });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to share chat' });
  }
};

// Get chats shared WITH the current user
export const getSharedChats = async (req: Request, res: Response) => {
  const userId = (req as any).user._id;

  try {
    const chats = await ChatModel.find({ 'collaborators.userId': userId }).sort({ updatedAt: -1 });
    res.json({ success: true, data: chats });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch shared chats' });
  }
};
