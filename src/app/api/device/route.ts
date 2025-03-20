import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { DeviceInsert, DeviceUpdate } from '@/types/database.types';

// POST endpoint to create or update device information
export async function POST(request: NextRequest) {
  try {
    const deviceData: DeviceInsert = await request.json();
    
    // Validate required fields
    if (!deviceData.user_id || !deviceData.brand || !deviceData.model) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, brand, and model are required' },
        { status: 400 }
      );
    }

    // Check if device record already exists for this user
    const { data: existingDevice } = await supabaseAdmin
      .from('devices')
      .select('id')
      .eq('user_id', deviceData.user_id)
      .maybeSingle();

    let result;
    
    if (existingDevice) {
      // Update existing device record
      result = await supabaseAdmin
        .from('devices')
        .update({
          brand: deviceData.brand,
          model: deviceData.model,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', deviceData.user_id)
        .select()
        .single();
    } else {
      // Insert new device record
      result = await supabaseAdmin
        .from('devices')
        .insert({
          ...deviceData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
    }

    const { data, error } = result;

    if (error) {
      console.error('Error saving device information:', error);
      return NextResponse.json(
        { error: 'Failed to save device information' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: existingDevice ? 200 : 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve device information
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

    // Get device information for the user
    const { data, error } = await supabaseAdmin
      .from('devices')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching device information:', error);
      return NextResponse.json(
        { error: 'Failed to fetch device information' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'No device information found for this user' },
        { status: 404 }
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

// PUT endpoint to update device information
export async function PUT(request: NextRequest) {
  try {
    const updateData: DeviceUpdate & { user_id: string } = await request.json();
    
    // Validate required fields
    if (!updateData.user_id) {
      return NextResponse.json(
        { error: 'Missing required field: user_id is required' },
        { status: 400 }
      );
    }

    if (!updateData.brand && !updateData.model) {
      return NextResponse.json(
        { error: 'At least one field (brand or model) must be provided for update' },
        { status: 400 }
      );
    }

    // Check if device record exists for this user
    const { data: existingDevice } = await supabaseAdmin
      .from('devices')
      .select('id')
      .eq('user_id', updateData.user_id)
      .maybeSingle();

    if (!existingDevice) {
      return NextResponse.json(
        { error: 'No device information found for this user' },
        { status: 404 }
      );
    }

    // Update device record
    const { data, error } = await supabaseAdmin
      .from('devices')
      .update({
        ...(updateData.brand && { brand: updateData.brand }),
        ...(updateData.model && { model: updateData.model }),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', updateData.user_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating device information:', error);
      return NextResponse.json(
        { error: 'Failed to update device information' },
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