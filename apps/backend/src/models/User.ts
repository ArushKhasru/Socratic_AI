import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '@socratic-ai/types';

export interface IUserDocument extends Omit<User, '_id'>, Document {
  password: string;
  deviceTokens: string[];
  notificationsEnabled: boolean;
  streak: number;
  lastActivityAt?: Date;
  subjects: string[];
}

const userSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    deviceTokens: { type: [String], default: [] },
    notificationsEnabled: { type: Boolean, default: true },
    streak: { type: Number, default: 0 },
    lastActivityAt: { type: Date },
    subjects: { type: [String], default: ['math', 'physics', 'chemistry', 'biology'] },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export const UserModel = mongoose.model<IUserDocument>('User', userSchema);
