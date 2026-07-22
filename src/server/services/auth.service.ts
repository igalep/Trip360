import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../db';
import { logger } from '../../utils/logger';

export interface UserDTO {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: UserDTO;
  token: string;
  expiresAt: string;
}

export class AuthService {
  private static SESSION_TTL_DAYS = 30;

  /**
   * Register a new user with pre-hashed password, store bcrypt hash, and issue session token.
   */
  public static async register(email: string, preHashedPassword: string, name: string): Promise<AuthResponse> {
    const existing = await db.execute({
      sql: 'SELECT id FROM users WHERE LOWER(email) = LOWER(?)',
      args: [email],
    });

    if (existing.rows.length > 0) {
      const err: any = new Error('An account with this email address already exists');
      err.status = 400;
      throw err;
    }

    const userId = crypto.randomUUID();
    const bcryptHash = await bcrypt.hash(preHashedPassword, 10);

    await db.execute({
      sql: 'INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)',
      args: [userId, email.toLowerCase().trim(), bcryptHash, name.trim()],
    });

    logger.info(`AuthService: Created new user account ${userId} (${email})`);
    return this.createSession(userId, email.toLowerCase().trim(), name.trim());
  }

  /**
   * Login user by validating pre-hashed password against stored bcrypt hash, and issue session token.
   */
  public static async login(email: string, preHashedPassword: string): Promise<AuthResponse> {
    const result = await db.execute({
      sql: 'SELECT id, email, password_hash, name FROM users WHERE LOWER(email) = LOWER(?)',
      args: [email],
    });

    if (result.rows.length === 0) {
      const err: any = new Error('Invalid email or password');
      err.status = 401;
      throw err;
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(preHashedPassword, String(user.password_hash));

    if (!passwordMatch) {
      const err: any = new Error('Invalid email or password');
      err.status = 401;
      throw err;
    }

    logger.info(`AuthService: User ${user.id} (${email}) logged in successfully`);
    return this.createSession(String(user.id), String(user.email), String(user.name));
  }

  /**
   * Revoke session token upon logout.
   */
  public static async logout(token: string): Promise<void> {
    await db.execute({
      sql: 'DELETE FROM sessions WHERE token = ?',
      args: [token],
    });
  }

  /**
   * Verify session token and return user details if valid & unexpired.
   */
  public static async verifySessionToken(token: string): Promise<UserDTO | null> {
    const nowIso = new Date().toISOString();
    const result = await db.execute({
      sql: `SELECT u.id, u.email, u.name 
            FROM sessions s 
            JOIN users u ON s.user_id = u.id 
            WHERE s.token = ? AND s.expires_at > ?`,
      args: [token, nowIso],
    });

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: String(row.id),
      email: String(row.email),
      name: String(row.name),
    };
  }

  /**
   * Helper to generate a new session token and insert into DB.
   */
  private static async createSession(userId: string, email: string, name: string): Promise<AuthResponse> {
    const sessionId = crypto.randomUUID();
    const token = crypto.randomBytes(32).toString('hex');
    
    const expiresDate = new Date();
    expiresDate.setDate(expiresDate.getDate() + this.SESSION_TTL_DAYS);
    const expiresAt = expiresDate.toISOString();

    await db.execute({
      sql: 'INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)',
      args: [sessionId, userId, token, expiresAt],
    });

    return {
      user: { id: userId, email, name },
      token,
      expiresAt,
    };
  }
}
