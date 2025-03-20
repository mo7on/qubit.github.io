import { NextRequest, NextResponse } from 'next/server';
import { processUserMessage } from '@/services/chat.service';
import { chatFilterMiddleware } from '../middleware';

async function handler(request: NextRequest) {
  try {
    const { userId, message } = await request.json();
    
    if (!userId || !message) {
      return NextResponse.json(
        { error: 'userId and message are required' },
        { status: 400 }
      );
    }

    // Process the user message through our chat service
    const result = await processUserMessage(userId, message);
    
    return NextResponse.json({
      conversation: result.conversation,
      message: result.userMessage,
      response: result.aiResponse.content,
      conversationId: result.conversation.id
    });
  } catch (error) {
    console.error('Error processing chat message:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

// Apply the chat filter middleware to the handler
export const POST = (request: NextRequest) => chatFilterMiddleware(request, handler);