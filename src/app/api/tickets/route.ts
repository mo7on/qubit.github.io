import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { TicketInsert, TicketUpdate } from '@/types/database.types';

export async function POST(request: NextRequest) {
  try {
    const ticketData: TicketInsert = await request.json();
    
    // Validate required fields
    if (!ticketData.user_id || !ticketData.title) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id and title are required' },
        { status: 400 }
      );
    }

    // Insert the ticket into Supabase
    const { data, error } = await supabaseAdmin
      .from('tickets')
      .insert({
        ...ticketData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating ticket:', error);
      return NextResponse.json(
        { error: 'Failed to create ticket' },
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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    // Query tickets for the specific user
    // Use order by to get the most recent tickets first
    const { data, error } = await supabaseAdmin
      .from('tickets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tickets:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tickets' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}