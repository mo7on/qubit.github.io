import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

// JWT secret for token signing (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRY = '24h'; // Token expires in 24 hours

// Admin credentials (should be stored securely and not in code)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin'; // In production, use hashed passwords

// Create a session for a user
export async function createSession(userId: string, role: string) {
  try {
    // Create a JWT token
    const token = jwt.sign(
      { 
        userId, 
        role,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      },
      JWT_SECRET
    );

    // Store the session in Supa