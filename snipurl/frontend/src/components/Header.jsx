import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Scissors, BarChart3, Wifi } from 'lucide-react';

/**
 * Header Navigation Component
 * Displays the main navigation, logo, and API connection status
 */
const Header = ({ apiStatus }) => {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Check if a navigation path is currently active
   * @param {string} path - The path to check
   * @returns {boolean} - Whether the path is active
   */
  const isActivePath = (path) => location.pathname === path;

  // Navigation items configuration
  const navigationItems = [
    { 
      path: '/shorten', 
      label: 'Shorten', 
      icon: Scissors,
      description: 'Create new short URLs'
    },
    { 
      path: '/my-urls', 
      label: 'My URLs', 
      icon: BarChart3,
      description: 'View and manage your URLs'
    },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* App logo and branding */}
          <Link 
            to="/shorten" 
            className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
            title="Go to URL Shortener"
          >
            <Scissors className="h-8 w-8" />
            <span className="text-xl font-bold">SnipURL</span>
          </Link>

          {/* Main navigation menu */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigationItems.map(({ path, label, icon: IconComponent }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActivePath(path)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                title={label}
              >
                <IconComponent className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          {/* API connection status indicator */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Wifi className="h-4 w-4 text-green-500" />
              <span className="text-xs text-gray-500">
                API Connected
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
