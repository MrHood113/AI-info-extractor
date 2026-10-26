import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

export interface User {
  id: string;
  email: string;
  passwordHash?: string;
  name: string;
  avatar?: string;
  googleId?: string;
  resetToken?: string;
  resetTokenExpires?: Date;
  createdAt: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'manabi_ai_jwt_super_secret_key_2026';
const JWT_EXPIRES_IN = '7d';

// In-memory fallback users store
const inMemoryUsers: User[] = [
  {
    id: 'demo-user-mr-hood',
    email: 'luxuryplayer113@gmail.com',
    passwordHash: bcrypt.hashSync('Password123!', 10),
    name: 'Mr Hood',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=MrHood',
    createdAt: new Date().toISOString(),
  },
];

export function generateToken(user: { id: string; email: string; name: string }): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token: string): { id: string; email: string; name: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string; name: string };
  } catch (err) {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const normalized = email.toLowerCase().trim();
  const user = inMemoryUsers.find((u) => u.email.toLowerCase() === normalized);
  return user || null;
}

export async function findUserById(id: string): Promise<User | null> {
  const user = inMemoryUsers.find((u) => u.id === id);
  return user || null;
}

export async function createUser(data: {
  email: string;
  password?: string;
  name: string;
  avatar?: string;
  googleId?: string;
}): Promise<User> {
  const normalized = data.email.toLowerCase().trim();
  const existing = await findUserByEmail(normalized);
  if (existing) {
    throw new Error('Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.');
  }

  const passwordHash = data.password ? await hashPassword(data.password) : undefined;
  const newUser: User = {
    id: crypto.randomUUID(),
    email: normalized,
    passwordHash,
    name: data.name,
    avatar: data.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}`,
    googleId: data.googleId,
    createdAt: new Date().toISOString(),
  };

  inMemoryUsers.push(newUser);
  return newUser;
}

export async function createPasswordResetToken(email: string): Promise<{ token: string; user: User }> {
  const normalized = email.toLowerCase().trim();
  const user = await findUserByEmail(normalized);
  if (!user) {
    throw new Error('Không tìm thấy tài khoản với email này.');
  }

  const token = crypto.randomBytes(32).toString('hex');
  user.resetToken = token;
  user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour valid

  return { token, user };
}

export async function resetPasswordWithToken(token: string, newPassword: string): Promise<User> {
  const user = inMemoryUsers.find(
    (u) => u.resetToken === token && u.resetTokenExpires && u.resetTokenExpires.getTime() > Date.now()
  );

  if (!user) {
    throw new Error('Mã khôi phục mật khẩu không hợp lệ hoặc đã hết hạn.');
  }

  user.passwordHash = await hashPassword(newPassword);
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;

  return user;
}
