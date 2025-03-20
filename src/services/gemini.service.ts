import { GoogleGenerativeAI } from '@google/generative-ai';
import { getUserDeviceInfo } from '@/utils/device-utils';

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Classify if a query is IT Support related
export async function classifyQuery(query: string): Promise<'IT Support' | 'Not IT Support'> {
  try {
    const prompt = `Is this query related to IT Support? Answer with either "IT Support" or "Not IT Support".
    
    Query: "${query}"`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Check if the response contains "IT Support"
    if (text.includes('IT Support')) {
      return 'IT Support';
    } else {
      return 'Not IT Support';
    }
  } catch (error) {
    console.error('Error classifying query:', error);
    // Default to IT Support in case of error to avoid blocking legitimate queries
    return 'IT Support';
  }
}

// Generate responses with device context
export async function generateResponse(prompt: string, userId?: string, conversationId?: string) {
  try {
    // Get device information if userId is provided
    let deviceContext = '';
    if (userId) {
      const deviceInfo = await getUserDeviceInfo(userId);
      deviceContext = `The user is using a ${deviceInfo.brand} ${deviceInfo.model}. `;
    }

    // Add conversation context if provided
    let conversationContext = '';
    if (conversationId) {
      conversationContext = `This is part of an ongoing IT support conversation (ID: ${conversationId}). `;
    }

    // Create the prompt for Gemini AI with device context
    const fullPrompt = `${deviceContext}${conversationContext}You are an IT Support assistant. Provide helpful, accurate, and concise responses to the following query: ${prompt}`;

    // Generate content using Gemini AI
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating response with Gemini AI:', error);
    throw error;
  }
}