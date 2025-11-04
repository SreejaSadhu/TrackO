import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { UserContext } from "../../context/UserContext";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    const user = searchParams.get('user');
    const error = searchParams.get('error');

    console.log('AuthCallback - Token:', token ? 'present' : 'missing');
    console.log('AuthCallback - User:', user ? 'present' : 'missing');
    console.log('AuthCallback - Error:', error);

    if (error) {
      console.log('Redirecting to login due to error');
      navigate('/login?error=authentication_failed');
      return;
    }

    if (token && user) {
      try {
        const userData = JSON.parse(decodeURIComponent(user));
        console.log('Parsed user data:', userData);
        localStorage.setItem("token", token);
        updateUser(userData);
        console.log('Navigating to dashboard');
        navigate("/dashboard");
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/login?error=parsing_failed');
      }
    } else {
      console.log('Missing token or user data, waiting or redirecting...');
      // Set a timeout to redirect if stuck
      const timeout = setTimeout(() => {
        console.log('Timeout reached, redirecting to login');
        setTimeoutReached(true);
        navigate('/login?error=authentication_timeout');
      }, 10000); // 10 seconds timeout

      return () => clearTimeout(timeout);
    }
  }, [searchParams, navigate, updateUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center bg-white p-8 rounded-lg shadow-md">
        {!timeoutReached ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Completing authentication...</p>
            <p className="mt-2 text-sm text-gray-500">Please wait while we log you in</p>
          </>
        ) : (
          <>
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <p className="text-gray-700 font-medium">Authentication is taking longer than expected</p>
            <p className="mt-2 text-sm text-gray-500">Redirecting you back to login...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
