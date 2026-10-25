
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1h',
    algorithm: 'HS256'
  });
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  // 1. Authorization header missing
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Authorization header is missing'
    });
  }

  // 2. Validate Bearer token format
  const [scheme, token, ...extra] = authHeader.trim().split(/\s+/);

  if (
    scheme?.toLowerCase() !== 'bearer' ||
    !token ||
    extra.length > 0
  ) {
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization format. Use Bearer <token>'
    });
  }

  // 3. Verify JWT
  jwt.verify(
    token,
    JWT_SECRET,
    { algorithms: ['HS256'] },
    (err, decoded, ) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            message: 'Token has expired'
          });
        }

        if (err.name === 'JsonWebTokenError') {
          return res.status(401).json({
            success: false,
            message: 'Invalid token'
          });
        }

        return res.status(401).json({
          success: false,
          message: 'Token verification failed'
        });
      }

      // 4. Token is valid
      req.user = decoded;
      next();
    }
  );
}

module.exports = { authenticateToken, generateToken };
