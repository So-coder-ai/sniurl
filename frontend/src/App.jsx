import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import UrlShortener from './components/UrlShortener';
import UrlList from './components/UrlList';
import UrlStats from './components/UrlStats';

/**
 * Main Application Component
 * This is the root component that handles routing and overall app state
 */
function App() {
  // Track whether our backend API is connected and ready
  const [apiConnectionStatus, setApiConnectionStatus] = useState('connected');

  // On app startup, verify API connection status
  useEffect(() => {
    // For now, we assume the API is always connected
    // In a real app, you might want to ping the backend here
    setApiConnectionStatus('connected');
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* App header with navigation and status */}
        <Header apiStatus={apiConnectionStatus} />
        
        {/* Main content area with routing */}
        <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* Redirect root to shorten URL page */}
            <Route path="/" element={<Navigate to="/shorten" replace />} />
            
            {/* URL shortener page - create new short URLs */}
            <Route path="/shorten" element={<UrlShortener />} />
            
            {/* URL list page - view and manage all URLs */}
            <Route path="/my-urls" element={<UrlList />} />
            
            {/* URL statistics page - view detailed analytics */}
            <Route path="/stats/:shortCode" element={<UrlStats />} />
          </Routes>
        </main>

        {/* App footer */}
        <footer className="bg-gray-800 text-white py-6 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm">© 2026 SnipURL. Fast, reliable URL shortening.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
