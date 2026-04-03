import React, { useState } from 'react';
import { Scissors, Copy, ExternalLink, Calendar, Shield } from 'lucide-react';

/**
 * URL Shortener Component
 * Allows users to create new short URLs with custom aliases and expiration dates
 */
const UrlShortener = () => {
  // Form data state for creating new URLs
  const [urlFormData, setUrlFormData] = useState({
    original_url: '',
    custom_alias: '',
    expires_at: ''
  });
  
  // UI state management
  const [isCreatingUrl, setIsCreatingUrl] = useState(false);
  const [createdUrlResult, setCreatedUrlResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCopiedToClipboard, setIsCopiedToClipboard] = useState(false);

  /**
   * Handle form input changes
   * @param {React.ChangeEvent<HTMLInputElement>} event - The input change event
   */
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUrlFormData(previousData => ({
      ...previousData,
      [name]: value
    }));
  };

  /**
   * Handle form submission to create a new short URL
   * @param {React.FormEvent<HTMLFormElement>} event - The form submission event
   */
  const handleCreateShortUrl = async (event) => {
    event.preventDefault();
    
    // Reset previous states
    setIsCreatingUrl(true);
    setErrorMessage('');
    setCreatedUrlResult(null);

    try {
      // Prepare the API request payload
      const urlCreationPayload = {
        original_url: urlFormData.original_url,
        // Only include optional fields if they have values
        ...(urlFormData.custom_alias && { custom_alias: urlFormData.custom_alias }),
        ...(urlFormData.expires_at && { expires_at: urlFormData.expires_at })
      };

      // Make API request to create short URL
      const apiResponse = await fetch('http://localhost:8000/urls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(urlCreationPayload)
      });
      
      // Handle API errors
      if (!apiResponse.ok) {
        throw new Error('Failed to create short URL');
      }
      
      // Process successful response
      const responseData = await apiResponse.json();
      setCreatedUrlResult(responseData);
      
      // Reset form after successful creation
      setUrlFormData({ original_url: '', custom_alias: '', expires_at: '' });
      
    } catch (error) {
      // Show user-friendly error message
      setErrorMessage(error.response?.data?.detail || 'Failed to create short URL');
    } finally {
      // Always stop loading state
      setIsCreatingUrl(false);
    }
  };

  /**
   * Copy text to clipboard with visual feedback
   * @param {string} textToCopy - The text to copy to clipboard
   */
  const copyTextToClipboard = async (textToCopy) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopiedToClipboard(true);
      // Reset copied state after 2 seconds
      setTimeout(() => setIsCopiedToClipboard(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Create Short URLs
        </h1>
        <p className="text-lg text-gray-600">
          Transform long URLs into short, memorable links with advanced features
        </p>
      </div>

      {/* Main form card */}
      <div className="card p-8">
        <form onSubmit={handleCreateShortUrl} className="space-y-6">
          {/* Original URL input */}
          <div>
            <label htmlFor="original_url" className="block text-sm font-medium text-gray-700 mb-2">
              Original URL *
            </label>
            <input
              type="url"
              id="original_url"
              name="original_url"
              value={urlFormData.original_url}
              onChange={handleInputChange}
              placeholder="https://example.com/very/long/url"
              className="input"
              required
            />
          </div>

          {/* Custom alias input */}
          <div>
            <label htmlFor="custom_alias" className="block text-sm font-medium text-gray-700 mb-2">
              Custom Alias (optional)
            </label>
            <input
              type="text"
              id="custom_alias"
              name="custom_alias"
              value={urlFormData.custom_alias}
              onChange={handleInputChange}
              placeholder="my-link"
              className="input"
            />
            <p className="mt-1 text-sm text-gray-500">
              Leave blank for auto-generated short code
            </p>
          </div>

          {/* Expiration date input */}
          <div>
            <label htmlFor="expires_at" className="block text-sm font-medium text-gray-700 mb-2">
              Expiration Date (optional)
            </label>
            <input
              type="datetime-local"
              id="expires_at"
              name="expires_at"
              value={urlFormData.expires_at}
              onChange={handleInputChange}
              className="input"
            />
            <p className="mt-1 text-sm text-gray-500">
              Leave blank for permanent link
            </p>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isCreatingUrl || !urlFormData.original_url}
            className="btn btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreatingUrl ? (
              <span className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Creating...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center space-x-2">
                <Scissors className="h-5 w-5" />
                <span>Shorten URL</span>
              </span>
            )}
          </button>
        </form>

        {/* Error message display */}
        {errorMessage && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* Success result display */}
        {createdUrlResult && (
          <div className="mt-6 result">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Scissors className="h-4 w-4 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Your Short URL</h3>
            </div>
            
            {/* URL display with actions */}
            <div className="url-display">
              <input
                type="text"
                value={createdUrlResult.short_url}
                readOnly
                className="bg-white"
              />
              <button
                onClick={() => copyTextToClipboard(createdUrlResult.short_url)}
                className="copy-btn"
                title="Copy to clipboard"
              >
                {isCopiedToClipboard ? 'Copied!' : <Copy className="h-4 w-4" />}
              </button>
              <a
                href={createdUrlResult.short_url}
                target="_blank"
                rel="noopener noreferrer"
                className="copy-btn"
                title="Open in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            {/* URL statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-primary-600">{createdUrlResult.click_count || 0}</div>
                <div className="text-xs text-gray-500">Clicks</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-lg font-mono text-primary-600">{createdUrlResult.short_code}</div>
                <div className="text-xs text-gray-500">Short Code</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-lg text-green-600">Active</div>
                <div className="text-xs text-gray-500">Status</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-sm text-primary-600">
                  {new Date(createdUrlResult.created_at).toLocaleDateString()}
                </div>
                <div className="text-xs text-gray-500">Created</div>
              </div>
            </div>

            {/* Original URL reference */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Original URL:</span> {createdUrlResult.original_url}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Feature highlights */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center space-x-2 mb-3">
            <Shield className="h-5 w-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Secure & Reliable</h3>
          </div>
          <p className="text-sm text-gray-600">
            All URLs are monitored and protected with advanced security features
          </p>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center space-x-2 mb-3">
            <Calendar className="h-5 w-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Flexible Expiration</h3>
          </div>
          <p className="text-sm text-gray-600">
            Set custom expiration dates or keep links active permanently
          </p>
        </div>
      </div>
    </div>
  );
};

export default UrlShortener;
