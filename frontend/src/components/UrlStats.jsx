import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  BarChart3, 
  Eye, 
  Calendar, 
  Globe, 
  Monitor, 
  ExternalLink,
  Copy,
  ArrowLeft,
  TrendingUp,
  Users
} from 'lucide-react';

/**
 * URL Statistics Component
 * Displays detailed analytics and click statistics for a specific URL
 */
const UrlStats = () => {
  // Get the short code from URL parameters
  const { shortCode } = useParams();
  
  // Component state management
  const [urlStatistics, setUrlStatistics] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isUrlCopied, setIsUrlCopied] = useState(false);

  /**
   * Load statistics when component mounts or short code changes
   */
  useEffect(() => {
    if (shortCode) {
      loadUrlStatistics();
    }
  }, [shortCode]);

  /**
   * Fetch URL statistics from the backend API
   */
  const loadUrlStatistics = async () => {
    try {
      setIsLoadingStats(true);
      setErrorMessage('');
      
      const apiResponse = await fetch(`http://localhost:8000/urls/${shortCode}/stats`);
      
      if (!apiResponse.ok) {
        throw new Error('Failed to fetch URL statistics');
      }
      
      const statisticsData = await apiResponse.json();
      setUrlStatistics(statisticsData);
    } catch (error) {
      setErrorMessage('Failed to fetch URL statistics');
      console.error('Statistics fetch error:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  /**
   * Copy URL to clipboard with visual feedback
   * @param {string} urlToCopy - The URL to copy
   */
  const copyUrlToClipboard = async (urlToCopy) => {
    try {
      await navigator.clipboard.writeText(urlToCopy);
      setIsUrlCopied(true);
      // Reset copied state after 2 seconds
      setTimeout(() => setIsUrlCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  /**
   * Format date for display
   * @param {string} dateString - ISO date string
   * @returns {string} - Formatted date string
   */
  const formatDateForDisplay = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Generate mock analytics data for demonstration
   * In a real application, this would come from the API
   */
  const generateMockAnalytics = () => {
    return {
      dailyClicks: [
        { day: 'Mon', clicks: 45 },
        { day: 'Tue', clicks: 62 },
        { day: 'Wed', clicks: 38 },
        { day: 'Thu', clicks: 91 },
        { day: 'Fri', clicks: 55 },
        { day: 'Sat', clicks: 23 },
        { day: 'Sun', clicks: 31 }
      ],
      geographicData: [
        { country: '🇺🇸 United States', percentage: 45, clicks: 145 },
        { country: '🇬🇧 United Kingdom', percentage: 20, clicks: 64 },
        { country: '🇨🇦 Canada', percentage: 15, clicks: 48 },
        { country: '🇩🇪 Germany', percentage: 8, clicks: 26 },
        { country: '🌍 Others', percentage: 12, clicks: 39 }
      ],
      deviceData: [
        { device: 'Desktop', percentage: 52, icon: '🖥️' },
        { device: 'Mobile', percentage: 38, icon: '📱' },
        { device: 'Tablet', percentage: 10, icon: '📋' }
      ],
      referrerData: [
        { source: 'Direct', percentage: 35 },
        { source: 'Social Media', percentage: 28 },
        { source: 'Search Engines', percentage: 22 },
        { source: 'Other', percentage: 15 }
      ]
    };
  };

  // Loading state display
  if (isLoadingStats) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Error state display
  if (errorMessage) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics Unavailable</h3>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <button
            onClick={loadUrlStatistics}
            className="btn btn-primary mr-4"
          >
            Try Again
          </button>
          <Link to="/my-urls" className="btn btn-secondary">
            Back to URLs
          </Link>
        </div>
      </div>
    );
  }

  // Mock analytics data for demonstration
  const mockAnalytics = generateMockAnalytics();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header with back navigation */}
      <div className="mb-8">
        <Link
          to="/my-urls"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to URLs
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          URL Analytics
        </h1>
        <p className="text-gray-600">
          Detailed statistics for <code className="bg-gray-100 px-2 py-1 rounded">{shortCode}</code>
        </p>
      </div>

      {/* URL Information Card */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          URL Information
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Short URL</h3>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={urlStatistics?.short_url || `http://localhost:8000/${shortCode}`}
                readOnly
                className="input text-sm"
              />
              <button
                onClick={() => copyUrlToClipboard(urlStatistics?.short_url || `http://localhost:8000/${shortCode}`)}
                className="copy-btn"
                title="Copy URL"
              >
                {isUrlCopied ? '✓' : <Copy className="h-4 w-4" />}
              </button>
              <a
                href={urlStatistics?.short_url || `http://localhost:8000/${shortCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="copy-btn"
                title="Open in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Original URL</h3>
            <div className="text-sm text-gray-900 truncate" title={urlStatistics?.original_url}>
              {urlStatistics?.original_url || 'Loading...'}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-primary-600 mb-2">
            {urlStatistics?.total_clicks || mockAnalytics.dailyClicks.reduce((sum, day) => sum + day.clicks, 0)}
          </div>
          <div className="text-sm text-gray-500 flex items-center justify-center">
            <Eye className="h-4 w-4 mr-1" />
            Total Clicks
          </div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {urlStatistics?.unique_visitors || Math.floor((urlStatistics?.total_clicks || 245) * 0.7)}
          </div>
          <div className="text-sm text-gray-500 flex items-center justify-center">
            <Users className="h-4 w-4 mr-1" />
            Unique Visitors
          </div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {urlStatistics?.avg_daily_clicks || Math.floor((urlStatistics?.total_clicks || 245) / 7)}
          </div>
          <div className="text-sm text-gray-500 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 mr-1" />
            Daily Average
          </div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {urlStatistics?.conversion_rate || '3.2%'}
          </div>
          <div className="text-sm text-gray-500 flex items-center justify-center">
            <BarChart3 className="h-4 w-4 mr-1" />
            Conversion Rate
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Daily Clicks Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Daily Clicks (Last 7 Days)
          </h3>
          <div className="space-y-3">
            {mockAnalytics.dailyClicks.map((day) => (
              <div key={day.day} className="flex items-center space-x-3">
                <div className="w-12 text-sm text-gray-500">{day.day}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                  <div
                    className="bg-primary-600 h-6 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${(day.clicks / 100) * 100}%` }}
                  >
                    <span className="text-xs text-white font-medium">{day.clicks}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Geographic Distribution
          </h3>
          <div className="space-y-3">
            {mockAnalytics.geographicData.map((country) => (
              <div key={country.country} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{country.country}</span>
                  <span className="text-xs text-gray-500">({country.clicks} clicks)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${country.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-12">
                    {country.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Device Breakdown */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Monitor className="h-5 w-5 mr-2" />
            Device Breakdown
          </h3>
          <div className="space-y-3">
            {mockAnalytics.deviceData.map((device) => (
              <div key={device.device} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{device.icon}</span>
                  <span className="text-sm">{device.device}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${device.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-12">
                    {device.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Traffic Sources
          </h3>
          <div className="space-y-3">
            {mockAnalytics.referrerData.map((source) => (
              <div key={source.source} className="flex items-center justify-between">
                <span className="text-sm">{source.source}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${source.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-12">
                    {source.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Information */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          Last updated: <span className="font-medium">{formatDateForDisplay(new Date().toISOString())}</span>
        </p>
        <p className="mt-1">
          Data refreshes automatically every 5 minutes
        </p>
      </div>
    </div>
  );
};

export default UrlStats;
