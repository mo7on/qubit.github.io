import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authMiddleware } from '../middleware/auth.middleware';

async function handler(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    // Check if the requesting user has permission to access this data
    const requestingUserId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (requestingUserId !== userId && userRole !== 'admin') {
      return NextResponse.json(
        { error: 'You do not have permission to access this data' },
        { status: 403 }
      );
    }

    // Fetch all user-related data
    const [
      ticketsResult,
      conversationsResult,
      messagesResult,
      devicesResult,
      articlesResult
    ] = await Promise.all([
      // Get tickets
      supabaseAdmin
        .from('tickets')
        .select('*')
        .eq('user_id', userId),
      
      // Get conversations
      supabaseAdmin
        .from('conversations')
        .select('*')
        .eq('user_id', userId),
      
      // Get messages
      supabaseAdmin
        .from('messages')
        .select('*')
        .eq('user_id', userId),
      
      // Get devices
      supabaseAdmin
        .from('devices')
        .select('*')
        .eq('user_id', userId),
      
      // Get articles (if they have user_id)
      supabaseAdmin
        .from('articles')
        .select('*')
        .eq('user_id', userId)
    ]);

    // Check for errors
    if (ticketsResult.error) {
      console.error('Error fetching tickets:', ticketsResult.error);
    }
    
    if (conversationsResult.error) {
      console.error('Error fetching conversations:', conversationsResult.error);
    }
    
    if (messagesResult.error) {
      console.error('Error fetching messages:', messagesResult.error);
    }
    
    if (devicesResult.error) {
      console.error('Error fetching devices:', devicesResult.error);
    }
    
    if (articlesResult.error) {
      console.error('Error fetching articles:', articlesResult.error);
    }

    // Return all the data
    return NextResponse.json({
      tickets: ticketsResult.data || [],
      conversations: conversationsResult.data || [],
      messages: messagesResult.data || [],
      devices: devicesResult.data || [],
      articles: articlesResult.data || []
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}

// Apply the auth middleware to the handler
export const GET = (request: NextRequest) => authMiddleware(request, handler);