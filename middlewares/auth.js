// eslint-disable-next-line no-undef
const jwt = require('jsonwebtoken');
const AuthorizationError = require('../src/errors/authorization-err');

const handleAuthError = () => {
  throw new AuthorizationError('Необходима авторизация');
};

// eslint-disable-next-line arrow-body-style, no-unused-vars
const extractBearerToken = (header) => {
  return header.replace('Bearer ', '');
};

// eslint-disable-next-line consistent-return
module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return handleAuthError();
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, 'super-strong-secret');
  } catch (err) {
    return handleAuthError();
  }

  req.user = payload; // записываем пейлоуд в объект запроса

  next(); // пропускаем запрос дальше
};
