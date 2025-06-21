import { useState, useEffect } from "react";
import "./App.css";
import "./styles/space-theme.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import GameModesPage from "./components/GameModesPage";
import LandingPage from "./components/LandingPage";
import LoginSignupPage from "./components/LoginSignupPage";
import MatchmakingPage from "./components/MatchmakingPage";
import OneVOnePage from "./components/OneVOnePage";
import ProfilePage from "./components/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import Logo from "./components/Logo";
import { getSocket, disconnectSocket, isSocketConnected } from "./utils/socket";
import { getUserData, validateAndRefreshUserData } from "./utils/auth";
import Lottie from "lottie-react";
import loadingAnimation from './assets/lottie/loading.json';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Centralized user state management
  const updateUserState = async (newUser) => {
    if (newUser) {
      setUser(newUser);
      // Initialize socket with user ID
      const socket = getSocket(newUser._id);
      if (!socket || !socket.connected) {
        console.log('Socket not connected, attempting to connect...');
        socket?.connect();
      }
    } else {
      setUser(null);
      // Clean up socket when user logs out
      disconnectSocket();
    }
  };

  useEffect(() => {
    const initializeUser = async () => {
      try {
        // First check localStorage
        const token = localStorage.getItem('token');
        const storedUserData = localStorage.getItem('userData');
        
        if (token && storedUserData) {
          // Set initial state from localStorage
          const parsedUserData = JSON.parse(storedUserData);
          
          // Initialize socket before setting user state
          const socket = getSocket(parsedUserData._id);
          if (!socket || !socket.connected) {
            console.log('Socket not connected on init, attempting to connect...');
            socket?.connect();
          }
          
          setUser(parsedUserData);
          
          // Validate with backend
          const validatedUser = await validateAndRefreshUserData(0, true);
          if (validatedUser) {
            await updateUserState(validatedUser);
          } else {
            await updateUserState(null);
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
          }
        } else {
          await updateUserState(null);
        }
      } catch (error) {
        console.error("Error initializing user:", error);
        await updateUserState(null);
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    initializeUser();

    // Set up periodic validation and socket health check
    const validationInterval = setInterval(async () => {
      if (user) {
        // Check socket connection
        if (!isSocketConnected()) {
          console.log('Socket disconnected, attempting to reconnect...');
          const socket = getSocket(user._id);
          socket?.connect();
        }

        // Validate user data
        const validatedUser = await validateAndRefreshUserData(0, true);
        if (validatedUser) {
          await updateUserState(validatedUser);
        } else {
          await updateUserState(null);
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
        }
      }
    }, 5 * 60 * 1000); // Validate every 5 minutes

    return () => {
      clearInterval(validationInterval);
      // Clean up socket on app unmount
      disconnectSocket();
    };
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const handleStorageChange = async (e) => {
      if (e.key === 'token' || e.key === 'userData') {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
          const validatedUser = await validateAndRefreshUserData(0, true);
          if (validatedUser) {
            await updateUserState(validatedUser);
          } else {
            await updateUserState(null);
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
          }
        } else {
          await updateUserState(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (loading || !isInitialized) {
    return (
      <div className="h-screen w-full flex items-center justify-center space-bg">
        <div className="w-[500px] h-[500px]">
          <Lottie 
            animationData={loadingAnimation} 
            loop={true}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-bg min-h-screen">
      <BrowserRouter>
        <Logo />
        <Routes>
          <Route path="/" element={<LandingPage user={user} />} />
          <Route path="/login-signup" element={<LoginSignupPage onLogin={updateUserState} />} />
          <Route path="/auth/callback" element={<LoginSignupPage onLogin={updateUserState} />} />
          <Route
            path="/game-modes"
            element={
              <ProtectedRoute>
                <GameModesPage user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/match-making"
            element={
              <ProtectedRoute>
                <MatchmakingPage user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/1v1"
            element={
              <ProtectedRoute>
                <OneVOnePage user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage user={user} />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
