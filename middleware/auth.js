const jwt = require('jsonwebtoken');
const config = require('config');
const jwtSecret = config.get('jwtSecret');

module.exports = function(req, res, next) {
  //pegar token do header
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ msg: 'Não autorizado!' });
  }
  //verificar token
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ msg: 'Token não é válido!' });
  }
};
