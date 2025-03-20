import { NextRequest, NextResponse } from 'next/server';
import { getConversationMessages, addMessage } from '@/services/chat.service';
import { generateResponse } from '@/services/gemini.service';
import { chatFilterMiddleware } from '@/app/api/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;

    const messages = await getConversationMessages(conversationId);
    
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

async function postHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;
    const { userId, message } = await request.json();
    
    if (!userId || !message) {
      return NextResponse.json(
        { error: 'userId and message are required' },
        { status: 400 }
      );
    }

    try {
      // Add the user message
      const userMessage = await addMessage(conversationId, userId, message, true);
      
      // Generate AI response
      const aiResponseText = await generateResponse(message, userId, conversationId);
      
      // Add the AI response
      const aiMessage = await addMessage(conversationId, userId, aiResponseText, false);
      
      return NextResponse.json({
        userMessage,
        aiMessage
      });
    } catch (error: any) {
      // Check if the error is due to a closed conversation
      if (error.message && error.message.includes('closed conversation')) {
        return NextResponse.json(
          { error: 'This conversation is closed. Please start a new conversation.' },
          { status: 403 }
        );
      }
      
      // Check if the error is due to message limit
      if (error.message && error.message.includes('maximum number of messages')) {
        return NextResponse.json(
          { error: 'This conversation has reached the maximum number of messages. Please start a new conversation.' },
          { status: 403 }
        );
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Error adding message to conversation:', error);
    return NextResponse.json(
      { error: 'Failed to add message' },
      { status: 500 }
    );
  }
}

// Apply the chat filter middleware to the POST handler
export const POST = (request: NextRequest, context: { params: { id: string } }) => 
  chatFilterMiddleware(request, (req) => postHandler(req, context));