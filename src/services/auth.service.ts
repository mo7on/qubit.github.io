import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

// Define the interface for decoded JWT tokens
interface DecodedToken {
  userId: string;
  role: string;
  exp: number;
  iat?: number;
}

// JWT secret for token signing (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRY = '24h'; // Token expires in 24 hours

// Admin credentials (should be stored securely and not in code)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin'; // In production, use hashed passwords

// Create a session for a user
export async function createSession(userId: string, role: string) {
  try {
    // Create a JWT token without setting exp in the payload (jwt.sign handles this)
    const token = jwt.sign(
      { 
        userId, 
        role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    // Store the session in Supabase
    const { data, error } = await supabaseAdmin
      .from('sessions')
      .insert({
        user_id: userId,
        token,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating session:', error);
      throw error;
    }

    return { token, session: data };
  } catch (error) {
    console.error('Unexpected error in createSession:', error);
    throw error;
  }
}

// Verify admin credentials
export async function verifyAdminCredentials(username: string, password: string) {
  // For a simple admin login, we can check against hardcoded values
  // In production, use a more secure approach with hashed passwords
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return {
      id: 'admin',
      role: 'admin',
    };
  }
  
  return null;
}

// Verify a JWT token
export function verifyToken(token: string): DecodedToken | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    return decoded;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

// Check if a session is valid
export async function isSessionValid(token: string) {
  try {
    // Verify the token
    const decoded = verifyToken(token);
    if (!decoded) {
      return false;
    }

    // Check if the session exists in the database
    const { data, error } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking session validity:', error);
    return false;
  }
}

// Delete a session (logout)
export async function deleteSession(token: string) {
  try {
    const { error } = await supabaseAdmin
      .from('sessions')
      .delete()
      .eq('token', token);

    if (error) {
      console.error('Error deleting session:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteSession:', error);
    throw error;
  }
}

// Get user info from token
export function getUserFromToken(token: string) {
  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }

    return {
      id: decoded.userId,
      role: decoded.role
    };
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
}