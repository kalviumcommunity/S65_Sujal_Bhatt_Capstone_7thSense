const jwt = require('jsonwebtoken');

const isAuthenticated = (req, res, next) => {
  console.log('=== Auth Middleware Debug ===');
  console.log('Request origin:', req.get('origin'));
  console.log('Auth header:', req.headers.authorization);
  console.log('Cookies:', req.cookies);

  // Check for token in Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      console.log('Verifying JWT token from header');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded:', { userId: decoded.userId });
      
      if (!decoded.userId) {
        console.error('Token missing userId');
        return res.status(401).json({ 
          message: "Invalid token format",
          error: "TOKEN_INVALID_FORMAT"
        });
      }

      // Set user in request
      req.user = { _id: decoded.userId };
      console.log('Authenticated via JWT token from header');
      return next();
    } catch (error) {
      console.error('JWT verification failed:', error.message);
      return res.status(401).json({ 
        message: "Invalid or expired token",
        error: "TOKEN_INVALID"
      });
    }
  }

  // If no valid token in header, check session
  if (req.isAuthenticated()) {
    console.log('Authenticated via session');
    return next();
  }

  // If no valid session, check cookie token
  const cookieToken = req.cookies?.auth_token;
  if (cookieToken) {
    try {
      console.log('Verifying cookie token');
      const decoded = jwt.verify(cookieToken, process.env.JWT_SECRET);
      console.log('Cookie token decoded:', { userId: decoded.userId });
      
      if (!decoded.userId) {
        console.error('Cookie token missing userId');
        return res.status(401).json({ 
          message: "Invalid token format",
          error: "TOKEN_INVALID_FORMAT"
        });
      }

      req.user = { _id: decoded.userId };
      console.log('Authenticated via cookie token');
      return next();
    } catch (error) {
      console.error('Cookie token verification failed:', error.message);
      return res.status(401).json({ 
        message: "Invalid or expired token",
        error: "TOKEN_INVALID"
      });
    }
  }

  console.log('Authentication failed - no valid token found');
  return res.status(401).json({ 
    message: "Not authenticated",
    error: "NO_TOKEN"
  });
};

module.exports = { isAuthenticated }; 
module.exports = { isAuthenticated }; 