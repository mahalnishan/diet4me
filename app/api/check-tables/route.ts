import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Check if tables exist and get their structure
    const tables = ['meal_plan_feedback', 'recipe_performance', 'user_profiles', 'nutritional_feedback'];
    const results: any = {};

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          results[table] = { exists: false, error: error.message };
        } else {
          results[table] = { exists: true, data: data };
        }
      } catch (err) {
        results[table] = { exists: false, error: err };
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Table check completed',
      results 
    });

  } catch (error) {
    console.error('Table check error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Table check failed',
      details: error 
    }, { status: 500 });
  }
}
