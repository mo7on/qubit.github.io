import { NextRequest, NextResponse } from 'next/server';
import { generateUserSpecificArticle } from '@/services/scheduler.service';

export async function POST(request: NextRequest) {
  try {
    const { userId, category } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Generate a user-specific article
    const article = await generateUserSpecificArticle(userId, category);
    
    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error('Error generating user-specific article:', error);
    return NextResponse.json(
      { error: 'Failed to generate user-specific article' },
      { status: 500 }
    );
  }
}