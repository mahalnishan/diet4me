-- Analytics Tables for Diet4Me
-- Comprehensive tracking system for user behavior and app performance

-- Main analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  user_id TEXT,
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  page_url TEXT,
  referrer TEXT,
  properties JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  user_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  screen_resolution TEXT,
  language TEXT,
  timezone TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  page_views INTEGER DEFAULT 0,
  events_count INTEGER DEFAULT 0,
  is_bot BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Page views tracking
CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id TEXT,
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  view_duration_seconds INTEGER,
  scroll_depth_percentage DECIMAL(5,2),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Diet plan generation tracking
CREATE TABLE IF NOT EXISTS diet_plan_generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id TEXT,
  plan_id TEXT NOT NULL,
  generation_type TEXT NOT NULL, -- 'ai_generated', 'mock', 'cached'
  user_inputs JSONB NOT NULL DEFAULT '{}',
  generation_time_ms INTEGER,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  api_response_time_ms INTEGER,
  tokens_used INTEGER,
  cost_usd DECIMAL(10,6),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User interactions tracking
CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id TEXT,
  interaction_type TEXT NOT NULL, -- 'click', 'scroll', 'hover', 'focus', 'blur'
  element_type TEXT, -- 'button', 'input', 'link', 'image', etc.
  element_id TEXT,
  element_class TEXT,
  element_text TEXT,
  page_path TEXT,
  coordinates JSONB, -- {x: number, y: number}
  properties JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature usage tracking
CREATE TABLE IF NOT EXISTS feature_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id TEXT,
  feature_name TEXT NOT NULL,
  feature_category TEXT, -- 'generation', 'feedback', 'export', 'navigation'
  action_type TEXT NOT NULL, -- 'view', 'click', 'complete', 'abandon'
  duration_seconds INTEGER,
  success BOOLEAN,
  error_message TEXT,
  properties JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance metrics
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id TEXT,
  metric_type TEXT NOT NULL, -- 'page_load', 'api_response', 'render_time'
  metric_name TEXT NOT NULL,
  value DECIMAL(10,3) NOT NULL, -- milliseconds or other units
  unit TEXT DEFAULT 'ms',
  page_path TEXT,
  api_endpoint TEXT,
  properties JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Error tracking
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT,
  user_id TEXT,
  error_type TEXT NOT NULL, -- 'javascript', 'api', 'database', 'validation'
  error_message TEXT NOT NULL,
  error_stack TEXT,
  page_path TEXT,
  user_agent TEXT,
  properties JSONB DEFAULT '{}',
  severity TEXT DEFAULT 'error', -- 'low', 'medium', 'high', 'critical'
  resolved BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- A/B testing results
CREATE TABLE IF NOT EXISTS ab_test_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id TEXT,
  test_name TEXT NOT NULL,
  variant TEXT NOT NULL,
  conversion_event TEXT,
  conversion_value DECIMAL(10,2),
  properties JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);

CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON user_sessions(started_at);

CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_timestamp ON page_views(timestamp);

CREATE INDEX IF NOT EXISTS idx_diet_plan_generations_session_id ON diet_plan_generations(session_id);
CREATE INDEX IF NOT EXISTS idx_diet_plan_generations_plan_id ON diet_plan_generations(plan_id);
CREATE INDEX IF NOT EXISTS idx_diet_plan_generations_timestamp ON diet_plan_generations(timestamp);

CREATE INDEX IF NOT EXISTS idx_user_interactions_session_id ON user_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_timestamp ON user_interactions(timestamp);

CREATE INDEX IF NOT EXISTS idx_feature_usage_session_id ON feature_usage(session_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_feature_name ON feature_usage(feature_name);
CREATE INDEX IF NOT EXISTS idx_feature_usage_timestamp ON feature_usage(timestamp);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_session_id ON performance_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_type ON performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);

CREATE INDEX IF NOT EXISTS idx_error_logs_session_id ON error_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_type ON error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON error_logs(timestamp);

CREATE INDEX IF NOT EXISTS idx_ab_test_results_session_id ON ab_test_results(session_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_results_test_name ON ab_test_results(test_name);
CREATE INDEX IF NOT EXISTS idx_ab_test_results_timestamp ON ab_test_results(timestamp);

-- Enable Row Level Security
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plan_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_results ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public access" ON analytics_events FOR ALL USING (true);
CREATE POLICY "Allow public access" ON user_sessions FOR ALL USING (true);
CREATE POLICY "Allow public access" ON page_views FOR ALL USING (true);
CREATE POLICY "Allow public access" ON diet_plan_generations FOR ALL USING (true);
CREATE POLICY "Allow public access" ON user_interactions FOR ALL USING (true);
CREATE POLICY "Allow public access" ON feature_usage FOR ALL USING (true);
CREATE POLICY "Allow public access" ON performance_metrics FOR ALL USING (true);
CREATE POLICY "Allow public access" ON error_logs FOR ALL USING (true);
CREATE POLICY "Allow public access" ON ab_test_results FOR ALL USING (true);

-- Create views for common analytics queries
CREATE OR REPLACE VIEW daily_analytics_summary AS
SELECT 
  DATE(timestamp) as date,
  COUNT(*) as total_events,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(CASE WHEN event_type = 'page_view' THEN 1 END) as page_views,
  COUNT(CASE WHEN event_type = 'generation' THEN 1 END) as diet_generations,
  COUNT(CASE WHEN event_type = 'feedback' THEN 1 END) as feedback_submissions
FROM analytics_events
GROUP BY DATE(timestamp)
ORDER BY date DESC;

CREATE OR REPLACE VIEW popular_pages AS
SELECT 
  page_path,
  COUNT(*) as views,
  COUNT(DISTINCT session_id) as unique_sessions,
  AVG(view_duration_seconds) as avg_duration_seconds
FROM page_views
GROUP BY page_path
ORDER BY views DESC;

CREATE OR REPLACE VIEW generation_metrics AS
SELECT 
  DATE(timestamp) as date,
  COUNT(*) as total_generations,
  COUNT(CASE WHEN success = true THEN 1 END) as successful_generations,
  AVG(generation_time_ms) as avg_generation_time_ms,
  AVG(api_response_time_ms) as avg_api_response_time_ms
FROM diet_plan_generations
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- Insert sample data for testing
INSERT INTO analytics_events (event_type, event_name, session_id, properties) VALUES
('page_view', 'home_page_loaded', 'test_session_1', '{"page_title": "Diet4Me - AI Diet Plan Generator"}'),
('generation', 'diet_plan_generated', 'test_session_1', '{"plan_type": "blueprint", "success": true}'),
('feedback', 'plan_rated', 'test_session_1', '{"rating": 5, "difficulty": "easy"}')
ON CONFLICT DO NOTHING;
