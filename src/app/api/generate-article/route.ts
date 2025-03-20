import { NextRequest, NextResponse } from 'next/server';
import { generateArticle } from '@/services/gemini.service';
import { supabaseAdmin } from '@/lib/supabase';
import { ArticleInsert } from '@/types/database.types';

export async function POST(request: NextRequest) {
  try {
    // Generate article content using Gemini AI
    const article = await generateArticle();
    
    // Prepare article data for insertion
    const articleData: ArticleInsert = {
      title: article.title,
      content: article.content,
      category: article.category,
    };

    // Insert article into Supabase
    const { data, error } = await supabaseAdmin
      .from('articles')
      .insert(articleData)
      .select()
      .single();

    if (error) {
      console.error('Error saving article:', error);
      return NextResponse.json(
        { error: 'Failed to save article' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}