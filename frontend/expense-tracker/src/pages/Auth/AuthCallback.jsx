import React, { useContext, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { UserContext } from "../../context/UserContext";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const user = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      navigate('/login?error=authentication_failed');
      return;
    }

    if (token && user) {
      try {
        const userData = JSON.parse(decodeURIComponent(user));
        localStorage.setItem("token", token);
        updateUser(userData);
        navigate("/dashboard");
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/login?error=parsing_failed');
      }
    } else {
      navigate('/login?error=missing_data');
    }
  }, [searchParams, updateUser, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
