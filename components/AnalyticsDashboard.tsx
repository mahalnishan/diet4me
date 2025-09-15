'use client';

import { useState, useEffect } from 'react';

interface DashboardData {
  summary: {
    totalEvents: number;
    uniqueSessions: number;
    uniqueUsers: number;
    totalGenerations: number;
    successfulGenerations: number;
    successRate: number;
    avgSessionDuration: number;
  };
  dailySummary: Array<{
    date: string;
    total_events: number;
    unique_sessions: number;
    unique_users: number;
    page_views: number;
    diet_generations: number;
    feedback_submissions: number;
  }>;
  popularPages: Array<{
    page_path: string;
    views: number;
    unique_sessions: number;
    avg_duration_seconds: number;
  }>;
  generationMetrics: Array<{
    date: string;
    total_generations: number;
    successful_generations: number;
    avg_generation_time_ms: number;
    avg_api_response_time_ms: number;
  }>;
  deviceBreakdown: Record<string, number>;
  browserBreakdown: Record<string, number>;
  errorStats: Array<{
    error_type: string;
    severity: string;
    count: number;
  }>;
  timeRange: {
    startDate: string;
    endDate: string;
    days: number;
  };
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/dashboard?days=${timeRange}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-600">
        Error: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-8 text-slate-500">
        No analytics data available.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(Number(e.target.value))}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Total Events</h3>
          <p className="text-3xl font-bold text-emerald-600">{data.summary.totalEvents.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Unique Sessions</h3>
          <p className="text-3xl font-bold text-blue-600">{data.summary.uniqueSessions.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Diet Generations</h3>
          <p className="text-3xl font-bold text-purple-600">{data.summary.totalGenerations.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Success Rate</h3>
          <p className="text-3xl font-bold text-green-600">{data.summary.successRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Daily Activity Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Daily Activity</h3>
        <div className="space-y-4">
          {data.dailySummary.slice(0, 7).map((day, index) => (
            <div key={day.date} className="flex items-center justify-between">
              <span className="text-slate-600">{new Date(day.date).toLocaleDateString()}</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm">{day.total_events} events</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">{day.unique_sessions} sessions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">{day.diet_generations} generations</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Pages */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Popular Pages</h3>
        <div className="space-y-3">
          {data.popularPages.slice(0, 5).map((page, index) => (
            <div key={page.page_path} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-semibold">
                  {index + 1}
                </div>
                <span className="font-medium text-slate-900">{page.page_path}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span>{page.views} views</span>
                <span>{page.unique_sessions} sessions</span>
                <span>{Math.round(page.avg_duration_seconds)}s avg</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Device & Browser Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Device Types</h3>
          <div className="space-y-2">
            {Object.entries(data.deviceBreakdown).map(([device, count]) => (
              <div key={device} className="flex items-center justify-between">
                <span className="capitalize text-slate-600">{device}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${(count / data.summary.uniqueSessions) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-600 w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Browsers</h3>
          <div className="space-y-2">
            {Object.entries(data.browserBreakdown).map(([browser, count]) => (
              <div key={browser} className="flex items-center justify-between">
                <span className="text-slate-600">{browser}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(count / data.summary.uniqueSessions) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-600 w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Error Statistics */}
      {data.errorStats.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Error Statistics</h3>
          <div className="space-y-3">
            {data.errorStats.map((error, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    error.severity === 'critical' ? 'bg-red-500' :
                    error.severity === 'high' ? 'bg-orange-500' :
                    error.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                  <span className="font-medium text-slate-900">{error.error_type}</span>
                  <span className="text-sm text-slate-500 capitalize">({error.severity})</span>
                </div>
                <span className="text-sm font-semibold text-red-600">{error.count} occurrences</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
