-- Supabase Database Schema for Diet4Me Feedback System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Meal Plan Feedback Table
CREATE TABLE meal_plan_feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Recipe Performance Table
CREATE TABLE recipe_performance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipe_name TEXT NOT NULL UNIQUE,
  total_ratings INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  success_rate DECIMAL(3,2) DEFAULT 0.00,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Profiles Table
CREATE TABLE user_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Nutritional Feedback Table
CREATE TABLE nutritional_feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Indexes for better performance
CREATE INDEX idx_meal_plan_feedback_plan_id ON meal_plan_feedback(plan_id);
CREATE INDEX idx_meal_plan_feedback_user_id ON meal_plan_feedback(user_id);
CREATE INDEX idx_meal_plan_feedback_created_at ON meal_plan_feedback(created_at);
CREATE INDEX idx_recipe_performance_rating ON recipe_performance(average_rating DESC);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_nutritional_feedback_user_id ON nutritional_feedback(user_id);
CREATE INDEX idx_nutritional_feedback_plan_id ON nutritional_feedback(plan_id);

-- Function to update recipe performance when feedback is added
CREATE OR REPLACE FUNCTION update_recipe_performance()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert recipe performance
  INSERT INTO recipe_performance (recipe_name, total_ratings, average_rating, success_rate, last_updated)
  VALUES (NEW.plan_id, 1, NEW.overall_rating, 
          CASE WHEN NEW.overall_rating >= 4 THEN 1.0 ELSE 0.0 END, NOW())
  ON CONFLICT (recipe_name) 
  DO UPDATE SET
    total_ratings = recipe_performance.total_ratings + 1,
    average_rating = (recipe_performance.average_rating * recipe_performance.total_ratings + NEW.overall_rating) / (recipe_performance.total_ratings + 1),
    success_rate = (recipe_performance.success_rate * recipe_performance.total_ratings + 
                   CASE WHEN NEW.overall_rating >= 4 THEN 1.0 ELSE 0.0 END) / (recipe_performance.total_ratings + 1),
    last_updated = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update recipe performance
CREATE TRIGGER trigger_update_recipe_performance
  AFTER INSERT ON meal_plan_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_recipe_performance();

-- Function to update user profile feedback count
CREATE OR REPLACE FUNCTION update_user_feedback_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user profile feedback count
  UPDATE user_profiles 
  SET feedback_count = feedback_count + 1,
      updated_at = NOW()
  WHERE user_id = NEW.user_id;
  
  -- If user doesn't exist, create a basic profile
  IF NOT FOUND THEN
    INSERT INTO user_profiles (user_id, feedback_count, created_at, updated_at)
    VALUES (NEW.user_id, 1, NOW(), NOW());
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user feedback count
CREATE TRIGGER trigger_update_user_feedback_count
  AFTER INSERT ON meal_plan_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_user_feedback_count();

-- Row Level Security (RLS) policies
ALTER TABLE meal_plan_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutritional_feedback ENABLE ROW LEVEL SECURITY;

-- Allow public access for now (you can restrict this later)
CREATE POLICY "Allow public access" ON meal_plan_feedback FOR ALL USING (true);
CREATE POLICY "Allow public access" ON user_profiles FOR ALL USING (true);
CREATE POLICY "Allow public access" ON nutritional_feedback FOR ALL USING (true);
CREATE POLICY "Allow public access" ON recipe_performance FOR ALL USING (true);

-- Sample data for testing
INSERT INTO recipe_performance (recipe_name, total_ratings, average_rating, success_rate) VALUES
('Super Veggie', 0, 0.00, 0.00),
('Nutty Pudding', 0, 0.00, 0.00),
('Mediterranean Bowl', 0, 0.00, 0.00),
('Asian Stir Fry', 0, 0.00, 0.00),
('Squash & Root Vegetable Roast', 0, 0.00, 0.00),
('Green Smoothie Bowl', 0, 0.00, 0.00);
