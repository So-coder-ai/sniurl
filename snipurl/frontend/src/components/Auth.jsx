import React, { useState } from 'react';
import { authAPI } from '../api';
import { User, Mail, Lock, Eye, EyeOff, LogIn, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        const loginData = {
          username: formData.username,
          password: formData.password,
        };
        
        const response = await authAPI.login(loginData);
        const { access_token, user } = response.data;
        setSuccess('Welcome back! Redirecting to your dashboard...');
        setTimeout(() => onLogin(user, access_token), 1000);
      } else {
        const registerData = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        };
        
        await authAPI.register(registerData);
        setSuccess('Account created successfully! Please sign in.');
        setTimeout(() => {
          setIsLogin(true);
          setFormData({ username: formData.username, email: '', password: '' });
          setSuccess('');
        }, 2000);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || 'Authentication failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setFormData({ username: '', email: '', password: '' });
  };

  const validateForm = () => {
    if (!formData.username || formData.username.length < 3) {
      return false;
    }
    if (!isLogin && (!formData.email || !formData.email.includes('@'))) {
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      return false;
    }
    return true;
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            {isLogin ? (
              <LogIn className="h-8 w-8 text-primary-600" />
            ) : (
              <UserPlus className="h-8 w-8 text-primary-600" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Welcome Back' : 'Join SnipURL'}
          </h1>
          <p className="text-gray-600">
            {isLogin 
              ? 'Sign in to manage your URLs and track analytics' 
              : 'Create your account and start shortening URLs'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder={isLogin ? "Enter your username" : "Choose a username"}
                className="input pl-10"
                required
                minLength={3}
              />
            </div>
            {!isLogin && formData.username && formData.username.length < 3 && (
              <p className="mt-1 text-sm text-amber-600">Username must be at least 3 characters</p>
            )}
          </div>

          {/* Email (only for registration) */}
          {!isLogin && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="input pl-10"
                  required
                />
              </div>
              {formData.email && !formData.email.includes('@') && (
                <p className="mt-1 text-sm text-amber-600">Please enter a valid email address</p>
              )}
            </div>
          )}

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                className="input pl-10 pr-10"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {!isLogin && formData.password && formData.password.length < 6 && (
              <p className="mt-1 text-sm text-amber-600">Password must be at least 6 characters</p>
            )}
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !validateForm()}
            className="btn btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
              </span>
            ) : (
              <span className="flex items-center justify-center space-x-2">
                {isLogin ? <LogIn className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              </span>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isLogin ? "New to SnipURL?" : "Already have an account?"}{' '}
            <button
              onClick={toggleMode}
              className="text-primary-600 hover:text-primary-700 font-medium hover:underline"
            >
              {isLogin ? 'Create an account' : 'Sign in instead'}
            </button>
          </p>
        </div>

        {/* Features */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            {isLogin ? 'Welcome back to:' : 'Get started with:'}
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Track detailed click analytics</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Manage and edit your links anytime</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Create custom aliases & set expiry dates</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>View geographic and device statistics</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Auth;
