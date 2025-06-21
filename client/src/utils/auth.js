const API_URL = import.meta.env.VITE_API_URL;

export const checkAuthAndRedirect = () => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('userData');
  
  if (!token || !userData) {
    clearAuthData();
    return false;
  }
  return true;
};

export const handleAuthRedirect = (navigate, destination = '/match-making') => {
  // Don't redirect if we're already on the destination page
  if (window.location.pathname === destination) {
    return;
  }

  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('userData');
  
  if (!token || !userData) {
    // Only clear and redirect if we're not already on the login page
    if (window.location.pathname !== '/login-signup') {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      navigate('/login-signup', { replace: true });
    }
    return;
  }

  // For protected routes, check if we have valid auth data first
  if (destination !== '/login-signup') {
    // If we have valid auth data, navigate immediately
    if (token && userData) {
      // Only navigate if we're not already on the destination
      if (window.location.pathname !== destination) {
        navigate(destination, { replace: true });
      }
      
      // Validate in background without blocking navigation
      validateAndRefreshUserData(0, true)
        .then(validatedUser => {
          if (!validatedUser) {
            // Only redirect if we're not already on the login page
            if (window.location.pathname !== '/login-signup') {
              localStorage.removeItem('token');
              localStorage.removeItem('userData');
              navigate('/login-signup', { replace: true });
            }
          }
        })
        .catch(error => {
          console.error('Error during auth validation:', error);
          // Only redirect if we're not already on the login page
          if (window.location.pathname !== '/login-signup') {
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            navigate('/login-signup', { replace: true });
          }
        });
    } else {
      // If no valid auth data, redirect to login
      if (window.location.pathname !== '/login-signup') {
        navigate('/login-signup', { replace: true });
      }
    }
  } else if (window.location.pathname !== destination) {
    navigate(destination, { replace: true });
  }
};

export const setAuthData = (token, userData) => {
  if (!token || !userData) {
    console.error('Invalid auth data provided:', { hasToken: !!token, hasUserData: !!userData });
    return false;
  }

  // Validate token before storing
  const trimmedToken = token.trim();
  if (!trimmedToken || trimmedToken === 'null' || trimmedToken === 'undefined') {
    console.error('Invalid token provided for storage');
    return false;
  }

  try {
    console.log('Storing auth data:', {
      tokenLength: trimmedToken.length,
      userDataKeys: Object.keys(userData)
    });
    
    localStorage.setItem('token', trimmedToken);
    localStorage.setItem('userData', JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error('Error setting auth data:', error);
    return false;
  }
};

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userData');
};

export const getUserData = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No valid token found for profile request');
      return null;
    }

    const response = await fetch(`${API_URL}/api/profile`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.user) {
        // Keep the existing token, only update user data
        localStorage.setItem('userData', JSON.stringify(data.user));
        window.dispatchEvent(new Event('profileDataUpdate'));
        return data.user;
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('userData');
  return !!(token && userData);
};

export const handleLogout = (navigate) => {
  clearAuthData();
  navigate('/login-signup');
};

// Add a token management utility
const getStoredToken = () => {
  const token = localStorage.getItem('token');
  if (!token || token === 'null' || token === 'undefined') {
    console.error('Invalid token in storage:', token);
    return null;
  }
  return token.trim();
};

export const validateAndRefreshUserData = async (retryCount = 0, skipInitialDelay = false) => {
  try {
    // Get token using the utility function
    const token = getStoredToken();
    console.log('Token validation attempt:', {
      hasToken: !!token,
      tokenLength: token?.length,
      retryCount,
      path: window.location.pathname
    });
    
    if (!token) {
      console.error('No valid token found for validation');
      return null;
    }

    // Only add delay for retries, not initial validation
    if (!skipInitialDelay && retryCount === 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Log the request we're about to make
    console.log('Making profile request:', {
      url: `${API_URL}/api/profile`,
      hasToken: true,
      tokenLength: token.length,
      path: window.location.pathname
    });

    const response = await fetch(`${API_URL}/api/profile`, {
      credentials: "include",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Profile response:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
      path: window.location.pathname
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.user) {
        // Update localStorage with fresh user data but keep the same token
        localStorage.setItem('userData', JSON.stringify(data.user));
        window.dispatchEvent(new Event('profileDataUpdate'));
        return data.user;
      }
    } else if (response.status === 401 && retryCount < 2) {
      // If unauthorized and we haven't retried too many times, wait and try again
      console.log(`Token validation failed (${response.status}), retrying (attempt ${retryCount + 1})...`);
      // Don't clear token on first retry
      if (retryCount === 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return validateAndRefreshUserData(retryCount + 1, true);
      }
    }
    
    // If we get here, validation failed
    console.error('User validation failed:', {
      status: response.status,
      statusText: response.statusText,
      retryCount,
      path: window.location.pathname
    });

    if (response.status === 401 && retryCount >= 1) {
      // Only clear auth data on actual auth failure after retries
      console.log('Clearing auth data after failed retries');
      clearAuthData();
    }
    return null;
  } catch (error) {
    console.error('Error validating user data:', {
      error: error.message,
      retryCount,
      path: window.location.pathname
    });
    
    if (retryCount < 2) {
      // If network error and we haven't retried too many times, wait and try again
      console.log(`Network error, retrying (attempt ${retryCount + 1})...`);
      await new Promise(resolve => setTimeout(resolve, 500));
      return validateAndRefreshUserData(retryCount + 1, true);
    }
    
    // Only clear auth data on final failure
    if (retryCount >= 1) {
      console.log('Clearing auth data after network error retries');
      clearAuthData();
    }
    return null;
  }
}; 

// Function to process profile picture URLs and use proxy for Google pictures
export const processProfilePictureUrl = (url, userName) => {
  if (!url) {
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}&backgroundColor=6366f1&textColor=ffffff`;
  }
  // If it's a Google profile picture, use our proxy
  if (url.includes('googleusercontent.com') || url.includes('lh3.googleusercontent.com')) {
    return `${API_URL}/api/profile-picture-proxy?url=${encodeURIComponent(url)}`;
  } else if (url.startsWith('http') && !url.startsWith(API_URL) && !url.includes('dicebear.com')) {
    // For other external URLs (but not Dicebear), use proxy as well
    return `${API_URL}/api/profile-picture-proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}; 