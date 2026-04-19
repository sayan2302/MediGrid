const { verifyIdToken } = require('../config/firebase');

const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      req.user = { uid: 'demo-user', email: 'demo@medigrid.local' };
      return next();
    }

    const token = header.replace('Bearer ', '').trim();
    const decoded = await verifyIdToken(token);
    req.user = decoded || { uid: 'demo-user', email: 'demo@medigrid.local' };
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid auth token' });
  }
};

module.exports = authMiddleware;
