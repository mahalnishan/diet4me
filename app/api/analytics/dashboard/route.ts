import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get daily analytics summary
    const { data: dailySummary, error: dailyError } = await supabase
      .from('daily_analytics_summary')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (dailyError) {
      console.error('Daily summary error:', dailyError);
    }

    // Get popular pages
    const { data: popularPages, error: pagesError } = await supabase
      .from('popular_pages')
      .select('*')
      .limit(10);

    if (pagesError) {
      console.error('Popular pages error:', pagesError);
    }

    // Get generation metrics
    const { data: generationMetrics, error: genError } = await supabase
      .from('generation_metrics')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (genError) {
      console.error('Generation metrics error:', genError);
    }

    // Get recent events
    const { data: recentEvents, error: eventsError } = await supabase
      .from('analytics_events')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);

    if (eventsError) {
      console.error('Recent events error:', eventsError);
    }

    // Get session statistics
    const { data: sessionStats, error: sessionError } = await supabase
      .from('user_sessions')
      .select('*')
      .gte('started_at', startDate.toISOString())
      .order('started_at', { ascending: false });

    if (sessionError) {
      console.error('Session stats error:', sessionError);
    }

    // Calculate summary statistics
    const totalEvents = recentEvents?.length || 0;
    const uniqueSessions = new Set(sessionStats?.map(s => s.session_id) || []).size;
    const uniqueUsers = new Set(sessionStats?.map(s => s.user_id).filter(Boolean) || []).size;
    const totalGenerations = generationMetrics?.reduce((sum, day) => sum + (day.total_generations || 0), 0) || 0;
    const successfulGenerations = generationMetrics?.reduce((sum, day) => sum + (day.successful_generations || 0), 0) || 0;
    const successRate = totalGenerations > 0 ? (successfulGenerations / totalGenerations) * 100 : 0;

    // Get device/browser breakdown
    const deviceBreakdown = sessionStats?.reduce((acc, session) => {
      const device = session.device_type || 'unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const browserBreakdown = sessionStats?.reduce((acc, session) => {
      const browser = session.browser || 'unknown';
      acc[browser] = (acc[browser] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Get error statistics - simplified query
    const { data: errorStats, error: errorError } = await supabase
      .from('error_logs')
      .select('error_type, severity')
      .gte('timestamp', startDate.toISOString());

    if (errorError) {
      console.error('Error stats error:', errorError);
    }

    const dashboard = {
      summary: {
        totalEvents,
        uniqueSessions,
        uniqueUsers,
        totalGenerations,
        successfulGenerations,
        successRate: Math.round(successRate * 100) / 100,
        avgSessionDuration: sessionStats?.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / (sessionStats?.length || 1)
      },
      dailySummary: dailySummary || [],
      popularPages: popularPages || [],
      generationMetrics: generationMetrics || [],
      recentEvents: recentEvents || [],
      deviceBreakdown,
      browserBreakdown,
      errorStats: errorStats ? 
        Object.entries(
          errorStats.reduce((acc, error) => {
            const key = `${error.error_type}_${error.severity}`;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).map(([key, count]) => {
          const [error_type, severity] = key.split('_');
          return { error_type, severity, count };
        }) : [],
      timeRange: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        days
      }
    };

    return NextResponse.json({ 
      success: true, 
      data: dashboard 
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch dashboard data' 
    }, { status: 500 });
  }
}
