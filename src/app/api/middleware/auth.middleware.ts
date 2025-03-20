import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, isSessionValid } from '@/services/auth.service';

export async function authMiddleware(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Check if the session is valid
    const isValid = await isSessionValid(token);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Unauthorized - Session expired' },
        { status: 401 }
      );
    }

    // Add the user info to the request
    const newRequest = new NextRequest(request.url, {
      headers: request.headers,
      method: request.method,
      body: request.body,
    });
    
    // Add user info to headers for the handler to access
    newRequest.headers.set('x-user-id', decoded.userId);
    newRequest.headers.set('x-user-role', decoded.role);

    // Proceed with the request
    return handler(newRequest);
  } catch (error) {
    console.error('Error in auth middleware:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Admin-only middleware
export async function adminMiddleware(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  try {
    // First apply the auth middleware
    return authMiddleware(request, async (req) => {
      // Check if the user is an admin
      const role = req.headers.get('x-user-role');
      
      if (role !== 'admin') {
        return NextResponse.json(
          { error: 'Forbidden - Admin access required' },
          { status: 403 }
        );
      }
      
      // Proceed with the request
      return handler(req);
    });
  } catch (error) {
    console.error('Error in admin middleware:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}