import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Copy, 
  ExternalLink, 
  Trash2, 
  Calendar, 
  Eye, 
  ToggleLeft,
  ToggleRight,
  RefreshCw
} from 'lucide-react';
import { urlAPI } from '../api';

/**
 * URL List Component
 * Displays and manages all created URLs with actions and statistics
 */
const UrlList = () => {
  // Component state management
  const [userUrls, setUserUrls] = useState([]);
  const [isLoadingUrls, setIsLoadingUrls] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [copiedUrlCode, setCopiedUrlCode] = useState('');
  const [pendingActions, setPendingActions] = useState({});

  /**
   * Fetch all URLs from the API when component mounts
   */
  useEffect(() => {
    loadUserUrls();
  }, []);

  /**
   * Load URLs from the backend API
   */
  const loadUserUrls = async () => {
    try {
      setIsLoadingUrls(true);
      const apiResponse = await urlAPI.getMyUrls();
      setUserUrls(apiResponse.data.urls || []);
      setFetchError('');
    } catch (error) {
      setFetchError('Failed to fetch URLs');
      console.error('URL fetch error:', error);
    } finally {
      setIsLoadingUrls(false);
    }
  };

  /**
   * Copy URL to clipboard with visual feedback
   * @param {string} urlToCopy - The URL to copy
   * @param {string} shortCode - The short code for tracking copied state
   */
  const copyUrlToClipboard = async (urlToCopy, shortCode) => {
    try {
      await navigator.clipboard.writeText(urlToCopy);
      setCopiedUrlCode(shortCode);
      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedUrlCode(''), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  /**
   * Toggle URL active status (enable/disable)
   * @param {string} shortCode - The short code of the URL to toggle
   * @param {boolean} currentStatus - Current active status
   */
  const toggleUrlActiveStatus = async (shortCode, currentStatus) => {
    setPendingActions(prev => ({ ...prev, [shortCode]: true }));
    
    try {
      const apiResponse = await urlAPI.updateUrl(shortCode, { is_active: !currentStatus });
      // Update local state to reflect the change
      setUserUrls(prevUrls => 
        prevUrls.map(url => 
          url.short_code === shortCode 
            ? { ...url, is_active: !currentStatus }
            : url
        )
      );
    } catch (error) {
      console.error('Toggle status error:', error);
      setFetchError('Failed to update URL status');
    } finally {
      setPendingActions(prev => ({ ...prev, [shortCode]: false }));
    }
  };

  /**
   * Delete a URL permanently
   * @param {string} shortCode - The short code of the URL to delete
   */
  const deleteUrl = async (shortCode) => {
    if (!confirm('Are you sure you want to delete this URL? This action cannot be undone.')) {
      return;
    }

    setPendingActions(prev => ({ ...prev, [shortCode]: true }));
    
    try {
      await urlAPI.deleteUrl(shortCode);
      // Remove URL from local state
      setUserUrls(prevUrls => prevUrls.filter(url => url.short_code !== shortCode));
    } catch (error) {
      console.error('Delete error:', error);
      setFetchError('Failed to delete URL');
    } finally {
      setPendingActions(prev => ({ ...prev, [shortCode]: false }));
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
      month: 'short',
      day: 'numeric'
    });
  };

  /**
   * Check if URL has expired
   * @param {Object} url - The URL object
   * @returns {boolean} - Whether the URL is expired
   */
  const isUrlExpired = (url) => {
    if (!url.expires_at) return false;
    return new Date(url.expires_at) < new Date();
  };

  // Loading state display
  if (isLoadingUrls) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your URLs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your URLs</h1>
        <p className="text-gray-600">Manage and track all your shortened URLs</p>
      </div>

      {/* Error display */}
      {fetchError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <p className="text-red-800">{fetchError}</p>
            <button
              onClick={loadUserUrls}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {userUrls.length === 0 && !fetchError && (
        <div className="text-center py-12 bg-white rounded-lg border">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No URLs yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first short URL to get started
          </p>
          <Link
            to="/shorten"
            className="btn btn-primary"
          >
            Create Your First URL
          </Link>
        </div>
      )}

      {/* URLs table */}
      {userUrls.length > 0 && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              {/* Table header */}
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Short URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Original URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              {/* Table body */}
              <tbody className="bg-white divide-y divide-gray-200">
                {userUrls.map((url) => (
                  <tr key={url.short_code} className="hover:bg-gray-50">
                    {/* Short URL */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <a
                          href={url.short_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-800 font-medium"
                        >
                          {url.short_url}
                        </a>
                      </div>
                    </td>

                    {/* Original URL */}
                    <td className="px-6 py-4">
                      <div className="max-w-xs truncate" title={url.original_url}>
                        {url.original_url}
                      </div>
                    </td>

                    {/* Clicks */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">{url.click_count || 0}</span>
                      </div>
                    </td>

                    {/* Created date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateForDisplay(url.created_at)}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isUrlExpired(url)
                          ? 'bg-gray-100 text-gray-800'
                          : url.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {isUrlExpired(url) ? 'Expired' : url.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Copy button */}
                        <button
                          onClick={() => copyUrlToClipboard(url.short_url, url.short_code)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Copy URL"
                        >
                          {copiedUrlCode === url.short_code ? (
                            <span className="text-green-600">✓</span>
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>

                        {/* Analytics button */}
                        <Link
                          to={`/stats/${url.short_code}`}
                          className="text-gray-400 hover:text-gray-600"
                          title="View Analytics"
                        >
                          <BarChart3 className="h-4 w-4" />
                        </Link>

                        {/* Toggle status button */}
                        <button
                          onClick={() => toggleUrlActiveStatus(url.short_code, url.is_active)}
                          disabled={pendingActions[url.short_code]}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          title={url.is_active ? 'Disable URL' : 'Enable URL'}
                        >
                          {pendingActions[url.short_code] ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                          ) : url.is_active ? (
                            <ToggleRight className="h-4 w-4" />
                          ) : (
                            <ToggleLeft className="h-4 w-4" />
                          )}
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => deleteUrl(url.short_code)}
                          disabled={pendingActions[url.short_code]}
                          className="text-red-400 hover:text-red-600 disabled:opacity-50"
                          title="Delete URL"
                        >
                          {pendingActions[url.short_code] ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{userUrls.length}</span> URLs
              </p>
              <button
                onClick={loadUserUrls}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UrlList;
