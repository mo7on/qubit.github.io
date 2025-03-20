import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminCredentials, createSession } from '@/services/auth.service';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Verify admin credentials
    const user = await verifyAdminCredentials(username, password);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create a session
    const { token, session } = await createSession(user.id, user.role);
    
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error in login endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}