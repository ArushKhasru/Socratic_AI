import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IChatDocument extends Document {
  userId: mongoose.Types.ObjectId;
  subject: string;
  topic?: string;
  messages: IMessage[];
  isActive: boolean;
  collaborators: { userId: mongoose.Types.ObjectId; access: 'read' | 'write' }[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const chatSchema = new Schema<IChatDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    topic: { type: String },
    messages: [messageSchema],
    isActive: { type: Boolean, default: true },
    collaborators: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        access: { type: String, enum: ['read', 'write'], default: 'read' },
      },
    ],
  },
  { timestamps: true }
);

export const ChatModel = mongoose.model<IChatDocument>('Chat', chatSchema);
