import { supabaseAdmin } from '@/lib/supabase';

export type DeviceInfo = {
  brand: string;
  model: string;
};

/**
 * Retrieves device information for a specific user
 * @param userId The user ID to get device information for
 * @returns Device information (brand and model) or default values if not found
 */
export async function getUserDeviceInfo(userId: string): Promise<DeviceInfo> {
  try {
    if (!userId) {
      return { brand: 'Unknown', model: 'Unknown' };
    }

    const { data } = await supabaseAdmin
      .from('devices')
      .select('brand, model')
      .eq('user_id', userId)
      .maybeSingle();
    
    return data || { brand: 'Unknown', model: 'Unknown' };
  } catch (error) {
    console.error('Error fetching device info:', error);
    return { brand: 'Unknown', model: 'Unknown' };
  }
}

/**
 * Checks if a user has device information stored
 * @param userId The user ID to check
 * @returns Boolean indicating if device info exists
 */
export async function hasDeviceInfo(userId: string): Promise<boolean> {
  try {
    if (!userId) return false;

    const { data, error } = await supabaseAdmin
      .from('devices')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    return !!data && !error;
  } catch (error) {
    console.error('Error checking device info:', error);
    return false;
  }
}