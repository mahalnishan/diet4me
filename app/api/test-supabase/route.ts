import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    console.log('Testing Supabase connection...');
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    // Test basic connection
    const { data, error } = await supabase
      .from('recipe_performance')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error 
      }, { status: 500 });
    }

    console.log('Supabase connection successful:', data);
    return NextResponse.json({ 
      success: true, 
      message: 'Supabase connection working',
      data: data 
    });

  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Connection test failed',
      details: error 
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    // Test inserting a record
    const { data, error } = await supabase
      .from('meal_plan_feedback')
      .insert([{
        plan_id: 'test_plan_' + Date.now(),
        overall_rating: 5,
        meal_ratings: { breakfast: 5, lunch: 4, dinner: 5, snack: 3 },
        difficulty: 'easy',
        prep_time_accuracy: 'accurate',
        taste_rating: 'loved',
        comments: 'Test feedback from API'
      }])
      .select();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error 
      }, { status: 500 });
    }

    console.log('Insert successful:', data);
    return NextResponse.json({ 
      success: true, 
      message: 'Test record inserted successfully',
      data: data 
    });

  } catch (error) {
    console.error('Insert test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Insert test failed',
      details: error 
    }, { status: 500 });
  }
}
