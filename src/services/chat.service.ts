import { supabaseAdmin } from '@/lib/supabase';
import { ConversationInsert, MessageInsert } from '@/types/database.types';
import { generateResponse } from './gemini.service';

// Create a new conversation
export async function createConversation(userId: string, title: string) {
  try {
    const conversationData: ConversationInsert = {
      user_id: userId,
      title,
      status: 'active',
      message_count: 0
    };

    const { data, error } = await supabaseAdmin
      .from('conversations')
      .insert(conversationData)
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error creating conversation:', error);
    throw error;
  }
}

// Get active conversation or create a new one
export async function getOrCreateActiveConversation(userId: string) {
  try {
    // Try to get the most recent active conversation
    const { data: activeConversation, error } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching active conversation:', error);
      throw error;
    }

    // If there's an active conversation, return it
    if (activeConversation) {
      return activeConversation;
    }

    // Otherwise, create a new conversation
    const title = `IT Support Chat ${new Date().toLocaleString()}`;
    return await createConversation(userId, title);
  } catch (error) {
    console.error('Unexpected error in getOrCreateActiveConversation:', error);
    throw error;
  }
}

// Add a message to a conversation
export async function addMessage(
  conversationId: string,
  userId: string,
  content: string,
  isUser: boolean
) {
  try {
    // Check if the conversation is active
    const { data: conversation, error: convError } = await supabaseAdmin
      .from('conversations')
      .select('status, message_count')
      .eq('id', conversationId)
      .single();

    if (convError) {
      console.error('Error fetching conversation:', convError);
      throw convError;
    }

    // If the conversation is closed, throw an error
    if (conversation.status === 'closed') {
      throw new Error('Cannot add message to a closed conversation');
    }

    // If the conversation has reached the message limit, throw an error
    if (conversation.message_count >= 10) {
      throw new Error('Conversation has reached the maximum number of messages');
    }

    // Add the message
    const messageData: MessageInsert = {
      conversation_id: conversationId,
      user_id: userId,
      content,
      is_user: isUser
    };

    const { data, error } = await supabaseAdmin
      .from('messages')
      .insert(messageData)
      .select()
      .single();

    if (error) {
      console.error('Error adding message:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error adding message:', error);
    throw error;
  }
}

// Process a user message and get AI response
export async function processUserMessage(userId: string, message: string) {
  try {
    // Get or create an active conversation
    const conversation = await getOrCreateActiveConversation(userId);
    
    // Add the user message
    await addMessage(conversation.id, userId, message, true);
    
    // Generate AI response
    const aiResponse = await generateResponse(message, userId, conversation.id);
    
    // Add the AI response
    const responseMessage = await addMessage(conversation.id, userId, aiResponse, false);
    
    return {
      conversation,
      userMessage: message,
      aiResponse: responseMessage
    };
  } catch (error) {
    console.error('Error processing user message:', error);
    throw error;
  }
}

// Get conversation history
export async function getConversationHistory(userId: string, limit = 10) {
  try {
    const { data, error } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching conversation history:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error in getConversationHistory:', error);
    throw error;
  }
}

// Get messages for a conversation
export async function getConversationMessages(conversationId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching conversation messages:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error in getConversationMessages:', error);
    throw error;
  }
}