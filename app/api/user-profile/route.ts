import { NextRequest, NextResponse } from "next/server";
import { supabase, UserProfile } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, preferences, restrictions } = body;

    // Check if profile exists
    const { data: existing, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Supabase error:', fetchError);
      return NextResponse.json({ error: 'Failed to check existing profile' }, { status: 500 });
    }

    const profileData: UserProfile = {
      user_id,
      preferences: preferences || {
        cuisine: [],
        spice_level: 'medium',
        cooking_time: 'moderate',
        difficulty: 'medium'
      },
      restrictions: restrictions || [],
      feedback_count: existing?.feedback_count || 0,
      updated_at: new Date().toISOString()
    };

    if (existing) {
      // Update existing profile
      const { error } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('user_id', user_id);

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
      }
    } else {
      // Create new profile
      const { error } = await supabase
        .from('user_profiles')
        .insert([{
          ...profileData,
          created_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('User profile API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    return NextResponse.json({ profile: profile || null });
  } catch (error) {
    console.error('User profile GET API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
