const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Token ausente' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.cargo !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito a administradores' });
  }
  next();
};

const requireSelfOrAdmin = (req, res, next) => {
  const targetId = Number(req.params.id);
  if (req.user?.cargo === 'admin' || req.user?.id === targetId) {
    return next();
  }
  return res.status(403).json({ error: 'Acesso negado' });
};

module.exports = { authenticateToken, requireAdmin, requireSelfOrAdmin };
