import React, { useState, useEffect } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ICONS, BRAND_NAME } from '../constants';

const Login: React.FC = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    setError(null);

    if (!credentialResponse.credential) {
      setError('No credential received from Google. Please try again.');
      return;
    }

    const result = login(credentialResponse.credential);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Login failed. Please try again.');
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In failed. Please try again.');
  };

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      {/* Logo and branding */}
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="transform scale-150">
            <ICONS.Bee />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          {BRAND_NAME} Tech Hub
        </h1>
        <p className="text-gray-400">
          Sign in to access the dashboard
        </p>
      </div>

      {/* Login card */}
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-sm shadow-2xl">
        <h2 className="text-xl font-semibold text-white mb-6 text-center">
          Welcome Back
        </h2>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Google Sign-In button container */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
            theme="filled_black"
            size="large"
            text="signin_with"
            shape="rectangular"
            width={280}
          />
        </div>

        {/* Info text */}
        <p className="mt-6 text-xs text-gray-500 text-center">
          Access restricted to authorized users only.
          <br />
          Contact your administrator for access.
        </p>
      </div>

      {/* Footer */}
      <p className="mt-8 text-gray-600 text-sm">
        &copy; {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
      </p>
    </div>
  );
};

export default Login;
