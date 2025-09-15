import { NextRequest, NextResponse } from "next/server";
import { supabase, MealPlanFeedback, NutritionalFeedback } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    console.log('Feedback API called with:', { type, data });

    // Validate required fields
    if (!type || !data) {
      return NextResponse.json({ 
        error: 'Missing required fields: type and data',
        success: false 
      }, { status: 400 });
    }

    if (type === 'meal_plan') {
      // Validate meal plan feedback data
      const requiredFields = ['plan_id', 'overall_rating', 'meal_ratings', 'difficulty', 'prep_time_accuracy', 'taste_rating'];
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        return NextResponse.json({ 
          error: `Missing required fields: ${missingFields.join(', ')}`,
          success: false 
        }, { status: 400 });
      }

      console.log('Inserting meal plan feedback...');
      
      const { data: insertedData, error } = await supabase
        .from('meal_plan_feedback')
        .insert([data as MealPlanFeedback])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json({ 
          error: 'Failed to save feedback', 
          details: error.message,
          code: error.code,
          success: false 
        }, { status: 500 });
      }

      console.log('Feedback inserted successfully:', insertedData);

      // Update recipe performance
      try {
        await updateRecipePerformance(data);
      } catch (perfError) {
        console.error('Error updating recipe performance:', perfError);
        // Don't fail the request if performance update fails
      }
      
      return NextResponse.json({ success: true, data: insertedData });
    }

    if (type === 'nutritional') {
      const { error } = await supabase
        .from('nutritional_feedback')
        .insert([data as NutritionalFeedback]);

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json({ error: 'Failed to save nutritional feedback' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid feedback type' }, { status: 400 });
  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const userId = searchParams.get('user_id');

    if (type === 'analytics') {
      // Get overall feedback analytics
      const { data: feedback, error } = await supabase
        .from('meal_plan_feedback')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
      }

      // Calculate analytics
      const analytics = calculateFeedbackAnalytics(feedback);
      return NextResponse.json(analytics);
    }

    if (type === 'user_profile' && userId) {
      // Get user profile and preferences
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        console.error('Supabase error:', error);
        return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
      }

      return NextResponse.json({ profile: profile || null });
    }

    if (type === 'popular_recipes') {
      // Get most popular recipes
      const { data: recipes, error } = await supabase
        .from('recipe_performance')
        .select('*')
        .order('average_rating', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json({ error: 'Failed to fetch popular recipes' }, { status: 500 });
      }

      return NextResponse.json({ recipes });
    }

    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
  } catch (error) {
    console.error('Feedback GET API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function updateRecipePerformance(feedback: MealPlanFeedback) {
  try {
    // This would need to be implemented based on your recipe structure
    // For now, we'll create a simple update mechanism
    const recipeName = feedback.plan_id; // You might want to extract actual recipe names
    
    const { data: existing, error: fetchError } = await supabase
      .from('recipe_performance')
      .select('*')
      .eq('recipe_name', recipeName)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching recipe performance:', fetchError);
      return;
    }

    if (existing) {
      // Update existing record
      const newTotalRatings = existing.total_ratings + 1;
      const newAverageRating = ((existing.average_rating * existing.total_ratings) + feedback.overall_rating) / newTotalRatings;
      
      await supabase
        .from('recipe_performance')
        .update({
          total_ratings: newTotalRatings,
          average_rating: newAverageRating,
          last_updated: new Date().toISOString()
        })
        .eq('recipe_name', recipeName);
    } else {
      // Create new record
      await supabase
        .from('recipe_performance')
        .insert([{
          recipe_name: recipeName,
          total_ratings: 1,
          average_rating: feedback.overall_rating,
          success_rate: feedback.overall_rating >= 4 ? 1 : 0,
          last_updated: new Date().toISOString()
        }]);
    }
  } catch (error) {
    console.error('Error updating recipe performance:', error);
  }
}

function calculateFeedbackAnalytics(feedback: MealPlanFeedback[]) {
  if (!feedback.length) {
    return {
      totalFeedback: 0,
      averageRating: 0,
      ratingDistribution: {},
      difficultyDistribution: {},
      tasteDistribution: {},
      prepTimeAccuracy: {}
    };
  }

  const totalFeedback = feedback.length;
  const averageRating = feedback.reduce((sum, f) => sum + f.overall_rating, 0) / totalFeedback;

  const ratingDistribution = feedback.reduce((acc, f) => {
    acc[f.overall_rating] = (acc[f.overall_rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const difficultyDistribution = feedback.reduce((acc, f) => {
    acc[f.difficulty] = (acc[f.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const tasteDistribution = feedback.reduce((acc, f) => {
    acc[f.taste_rating] = (acc[f.taste_rating] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const prepTimeAccuracy = feedback.reduce((acc, f) => {
    acc[f.prep_time_accuracy] = (acc[f.prep_time_accuracy] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalFeedback,
    averageRating: Math.round(averageRating * 10) / 10,
    ratingDistribution,
    difficultyDistribution,
    tasteDistribution,
    prepTimeAccuracy
  };
}
