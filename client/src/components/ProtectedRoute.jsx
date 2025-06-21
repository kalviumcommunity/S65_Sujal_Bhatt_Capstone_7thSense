import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { validateAndRefreshUserData } from '../utils/auth';
import Lottie from "lottie-react";
import loadingAnimation from '../assets/lottie/loading.json';

const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const validateAuth = async () => {
      try {
        const validatedUser = await validateAndRefreshUserData(0, true);
        setIsAuthenticated(!!validatedUser);
      } catch (error) {
        console.error('Auth validation error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    validateAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center space-bg">
        <div className="w-screen h-screen">
          <Lottie 
            animationData={loadingAnimation} 
            loop={true}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login-signup" replace />;
  }

  return children;
};

export default ProtectedRoute; 