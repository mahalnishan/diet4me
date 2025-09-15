-- Simplified Supabase Schema for Diet4Me Feedback System
-- This will work with existing tables and add missing columns

-- First, let's check what columns exist in meal_plan_feedback
-- If the table exists but has wrong columns, we'll need to alter it

-- Drop existing tables if they have wrong structure (be careful!)
-- DROP TABLE IF EXISTS meal_plan_feedback CASCADE;
-- DROP TABLE IF EXISTS recipe_performance CASCADE;

-- Create meal_plan_feedback table with correct structure
CREATE TABLE IF NOT EXISTS meal_plan_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  plan_id TEXT NOT NULL,
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  meal_ratings JSONB NOT NULL DEFAULT '{}',
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  prep_time_accuracy TEXT NOT NULL CHECK (prep_time_accuracy IN ('accurate', 'too-long', 'too-short')),
  taste_rating TEXT NOT NULL CHECK (taste_rating IN ('loved', 'liked', 'neutral', 'disliked')),
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recipe_performance table
CREATE TABLE IF NOT EXISTS recipe_performance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_name TEXT NOT NULL UNIQUE,
  total_ratings INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  success_rate DECIMAL(3,2) DEFAULT 0.00,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  preferences JSONB NOT NULL DEFAULT '{
    "cuisine": [],
    "spice_level": "medium",
    "cooking_time": "moderate",
    "difficulty": "medium"
  }',
  restrictions TEXT[] DEFAULT '{}',
  feedback_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create nutritional_feedback table
CREATE TABLE IF NOT EXISTS nutritional_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  energy_level INTEGER NOT NULL CHECK (energy_level >= 1 AND energy_level <= 10),
  satiety INTEGER NOT NULL CHECK (satiety >= 1 AND satiety <= 10),
  digestive_comfort INTEGER NOT NULL CHECK (digestive_comfort >= 1 AND digestive_comfort <= 10),
  adherence_percentage INTEGER NOT NULL CHECK (adherence_percentage >= 0 AND adherence_percentage <= 100),
  weight_change DECIMAL(5,2),
  health_metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meal_plan_feedback_plan_id ON meal_plan_feedback(plan_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_feedback_user_id ON meal_plan_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_feedback_created_at ON meal_plan_feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_recipe_performance_rating ON recipe_performance(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_nutritional_feedback_user_id ON nutritional_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_nutritional_feedback_plan_id ON nutritional_feedback(plan_id);

-- Enable Row Level Security
ALTER TABLE meal_plan_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutritional_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_performance ENABLE ROW LEVEL SECURITY;

-- Allow public access for now
DROP POLICY IF EXISTS "Allow public access" ON meal_plan_feedback;
CREATE POLICY "Allow public access" ON meal_plan_feedback FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public access" ON user_profiles;
CREATE POLICY "Allow public access" ON user_profiles FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public access" ON nutritional_feedback;
CREATE POLICY "Allow public access" ON nutritional_feedback FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public access" ON recipe_performance;
CREATE POLICY "Allow public access" ON recipe_performance FOR ALL USING (true);

-- Insert sample data for testing
INSERT INTO recipe_performance (recipe_name, total_ratings, average_rating, success_rate) VALUES
('Super Veggie', 0, 0.00, 0.00),
('Nutty Pudding', 0, 0.00, 0.00),
('Mediterranean Bowl', 0, 0.00, 0.00),
('Asian Stir Fry', 0, 0.00, 0.00),
('Squash & Root Vegetable Roast', 0, 0.00, 0.00),
('Green Smoothie Bowl', 0, 0.00, 0.00)
ON CONFLICT (recipe_name) DO NOTHING;
