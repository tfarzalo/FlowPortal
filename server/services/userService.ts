import { supabase } from '../config/supabase.js';
import { generatePasswordHash, validatePassword } from '../utils/password.js';

export interface IUser {
  id: string;
  email: string;
  password: string;
  created_at: Date;
  last_login_at: Date;
  is_active: boolean;
  role: string;
  refresh_token: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  name?: string;
  role?: string;
}

class UserService {
  static async list(): Promise<IUser[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      throw new Error(`Database error while listing users: ${err}`);
    }
  }

  static async get(id: string): Promise<IUser | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      return data;
    } catch (err) {
      throw new Error(`Database error while getting the user by their ID: ${err}`);
    }
  }

  static async getByEmail(email: string): Promise<IUser | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      return data;
    } catch (err) {
      throw new Error(`Database error while getting the user by their email: ${err}`);
    }
  }

  static async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    try {
      const { data: updated, error } = await supabase
        .from('users')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return updated;
    } catch (err) {
      throw new Error(`Database error while updating user ${id}: ${err}`);
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (err) {
      throw new Error(`Database error while deleting user ${id}: ${err}`);
    }
  }

  static async authenticateWithPassword(email: string, password: string): Promise<IUser | null> {
    if (!email) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');

    try {
      const user = await this.getByEmail(email);
      if (!user) return null;

      const passwordValid = await validatePassword(password, user.password);
      if (!passwordValid) return null;

      // Update last login
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return updatedUser;
    } catch (err) {
      throw new Error(`Database error while authenticating user ${email} with password: ${err}`);
    }
  }

  static async create({ email, password, name = '', role = 'user' }: CreateUserData): Promise<IUser> {
    if (!email) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');

    const existingUser = await UserService.getByEmail(email);
    if (existingUser) throw new Error('User with this email already exists');

    const hash = await generatePasswordHash(password);

    try {
      const { data: user, error } = await supabase
        .from('users')
        .insert({
          email: email.toLowerCase(),
          password: hash,
          role,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return user;
    } catch (err) {
      throw new Error(`Database error while creating new user: ${err}`);
    }
  }

  static async setPassword(userId: string, password: string): Promise<IUser> {
    if (!password) throw new Error('Password is required');
    
    const hash = await generatePasswordHash(password);

    try {
      const { data: user, error } = await supabase
        .from('users')
        .update({ password: hash })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return user;
    } catch (err) {
      throw new Error(`Database error while setting password: ${err}`);
    }
  }

  static async getByRefreshToken(token: string): Promise<IUser | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('refresh_token', token)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    } catch (err) {
      throw new Error(`Database error while getting user by refresh token: ${err}`);
    }
  }
}

export { UserService };
export default UserService;
