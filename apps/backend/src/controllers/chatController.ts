import { Request, Response } from 'express';
import { ChatModel } from '../models/Chat';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

// Start or resume a chat for a subject
export const startChat = async (req: Request, res: Response) => {
  const { subject } = req.body;
  const userId = (req as any).user._id;

  try {
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

// Get all chats for the current user
export const getChats = async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const { subject } = req.query;

  try {
    const filter: any = { userId };
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
    const chat = await ChatModel.findOne({ _id: id, userId });
    if (!chat) {
      return res.status(404).json({ success: false, error: 'Chat not found' });
    }
    res.json({ success: true, data: chat });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch chat' });
  }
};
