import React, { useState, useEffect } from 'react';
import ParallaxBackground from '../components/ParallaxBackground';

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('7d'); // 7d, 30d, 90d, all

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      let url = '/api/analytics';
      const params = new URLSearchParams();

      // Add date range filter
      if (dateRange !== 'all') {
        const endDate = new Date();
        const startDate = new Date();
        
        switch (dateRange) {
          case '7d':
            startDate.setDate(endDate.getDate() - 7);
            break;
          case '30d':
            startDate.setDate(endDate.getDate() - 30);
            break;
          case '90d':
            startDate.setDate(endDate.getDate() - 90);
            break;
        }

        params.append('startDate', startDate.toISOString());
        params.append('endDate', endDate.toISOString());
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(Math.round(num));
  };

  const formatTime = (minutes) => {
    if (minutes < 1) return '< 1 min';
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const formatDuration = (minutes) => {
    return formatTime(minutes);
  };

  if (loading) {
    return (
      <>
        <ParallaxBackground />
        <div className="min-h-screen flex items-center justify-center p-6 relative z-10">
          <div className="glass-card p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-300 mx-auto mb-4"></div>
            <p className="body-text">Loading analytics...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <ParallaxBackground />
        <div className="min-h-screen flex items-center justify-center p-6 relative z-10">
          <div className="glass-card p-8 text-center">
            <p className="body-text text-red-300 mb-4">{error}</p>
            <button 
              onClick={fetchAnalytics}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ParallaxBackground />
      <div className="min-h-screen p-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="section-title">📊 OlgaGPT Analytics</h1>
              <div className="flex items-center space-x-4">
                <select 
                  value={dateRange} 
                  onChange={(e) => setDateRange(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="all">All time</option>
                </select>
                <button 
                  onClick={fetchAnalytics}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors text-sm"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="glass-card p-6 text-center">
              <div className="text-3xl font-bold text-blue-300 mb-2">
                {formatNumber(analytics.totalSessions)}
              </div>
              <div className="text-white/70 text-sm">Total Sessions</div>
            </div>
            
            <div className="glass-card p-6 text-center">
              <div className="text-3xl font-bold text-green-300 mb-2">
                {formatNumber(analytics.totalQuestions)}
              </div>
              <div className="text-white/70 text-sm">Total Questions</div>
            </div>
            
            <div className="glass-card p-6 text-center">
              <div className="text-3xl font-bold text-purple-300 mb-2">
                {formatNumber(analytics.averageQuestionsPerSession)}
              </div>
              <div className="text-white/70 text-sm">Avg Questions/Session</div>
            </div>
            
            <div className="glass-card p-6 text-center">
              <div className="text-3xl font-bold text-yellow-300 mb-2">
                {formatDuration(analytics.sessionDuration)}
              </div>
              <div className="text-white/70 text-sm">Avg Session Duration</div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">⚡ Performance Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/70">Average Response Time:</span>
                  <span className="text-white">{formatTime(analytics.averageResponseTime / 1000 / 60)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Average Confidence:</span>
                  <span className="text-white">{Math.round(analytics.averageConfidence)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Total Tokens Used:</span>
                  <span className="text-white">{formatNumber(analytics.totalTokens)}</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">📚 Most Used Sources</h3>
              <div className="space-y-2">
                {analytics.mostCommonSources.slice(0, 5).map((source, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-white/70 text-sm truncate flex-1">
                      {source.source.replace('.md', '')}
                    </span>
                    <span className="text-white text-sm ml-2">{source.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Questions */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">🔥 Top Questions</h3>
            <div className="space-y-3">
              {analytics.topQuestions.slice(0, 10).map((item, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <span className="text-white/50 text-sm min-w-[20px]">#{index + 1}</span>
                  <div className="flex-1">
                    <div className="text-white text-sm">{item.question}</div>
                    <div className="text-white/50 text-xs">Asked {item.count} times</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 