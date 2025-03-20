import { NextRequest, NextResponse } from 'next/server';
import { hasDeviceInfo } from '@/utils/device-utils';
import { classifyQuery } from '@/services/gemini.service';

export async function deviceMiddleware(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  try {
    // Only apply to POST requests that might contain userId
    if (request.method === 'POST') {
      const body = await request.json();
      
      // If userId is provided, check if device info exists
      if (body.userId) {
        const hasDevice = await hasDeviceInfo(body.userId);
        
        // Clone the request to avoid consuming the body
        const newRequest = new NextRequest(request.url, {
          headers: request.headers,
          method: request.method,
          body: JSON.stringify(body),
        });
        
        // Add a header to indicate if device info is missing
        if (!hasDevice) {
          newRequest.headers.set('X-Device-Info-Missing', 'true');
        }
        
        return handler(newRequest);
      }
    }
    
    // For all other requests, proceed normally
    return handler(request);
  } catch (error) {
    console.error('Error in device middleware:', error);
    return handler(request);
  }
}

export async function chatFilterMiddleware(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  try {
    // Only apply to POST requests to the chat endpoint
    if (request.method === 'POST' && request.url.includes('/api/chat')) {
      const body = await request.json();
      
      if (body.message && typeof body.message === 'string') {
        // Classify the query
        const classification = await classifyQuery(body.message);
        
        // If not IT Support related, return early with a message
        if (classification !== 'IT Support') {
          return NextResponse.json({
            response: 'This system is only for IT Support-related inquiries.',
            filtered: true
          });
        }
        
        // Clone the request to avoid consuming the body
        const newRequest = new NextRequest(request.url, {
          headers: request.headers,
          method: request.method,
          body: JSON.stringify(body),
        });
        
        return handler(newRequest);
      }
    }
    
    // For all other requests, proceed normally
    return handler(request);
  } catch (error) {
    console.error('Error in chat filter middleware:', error);
    return handler(request);
  }
}