import { NextRequest, NextResponse } from 'next/server';
import { initializeScheduler } from '@/lib/scheduler';

export async function GET(request: NextRequest) {
  try {
    initializeScheduler();
    return NextResponse.json({ message: 'Scheduler initialized successfully' });
  } catch (error) {
    console.error('Error initializing scheduler:', error);
    return NextResponse.json(
      { error: 'Failed to initialize scheduler' },
      { status: 500 }
    );
  }
}