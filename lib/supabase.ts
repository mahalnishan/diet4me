import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface MealPlanFeedback {
  id?: string
  user_id?: string
  plan_id: string
  overall_rating: number
  meal_ratings: {
    breakfast?: number
    lunch?: number
    dinner?: number
    snack?: number
  }
  difficulty: 'easy' | 'medium' | 'hard'
  prep_time_accuracy: 'accurate' | 'too-long' | 'too-short'
  taste_rating: 'loved' | 'liked' | 'neutral' | 'disliked'
  comments?: string
  created_at?: string
}

export interface UserProfile {
  id?: string
  user_id: string
  preferences: {
    cuisine: string[]
    spice_level: 'mild' | 'medium' | 'spicy'
    cooking_time: 'quick' | 'moderate' | 'elaborate'
    difficulty: 'easy' | 'medium' | 'hard'
  }
  restrictions: string[]
  feedback_count: number
  created_at?: string
  updated_at?: string
}

export interface NutritionalFeedback {
  id?: string
  user_id: string
  plan_id: string
  energy_level: number
  satiety: number
  digestive_comfort: number
  adherence_percentage: number
  weight_change?: number
  health_metrics?: any
  created_at?: string
}
