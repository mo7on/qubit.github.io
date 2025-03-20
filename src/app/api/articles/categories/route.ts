import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get distinct categories from the articles table
    const { data, error } = await supabaseAdmin
      .from('articles')
      .select('category')
      .order('category')
      .is('category', 'not.null');

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      );
    }

    // Extract unique categories
    const categories = [...new Set(data.map(item => item.category))];

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}