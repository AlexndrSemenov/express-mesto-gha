const bcrypt = require('bcryptjs'); // импортируем bcrypt
const jwt = require('jsonwebtoken'); // импортируем модуль jsonwebtoken
const User = require('../models/user');
const BadRequestError = require('../errors/bad-request-err');
const NotFoundError = require('../errors/not-found-err');
const AlreadExistsErr = require('../errors/already-exists-err');
const AuthorizationError = require('../errors/authorization-err');

exports.createUser = (req, res, next) => { // регистрация пользователя
  const {
    email, name, about, avatar,
  } = req.body;
  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create({
      email,
      password: hash, // записываем хеш в базу
      name,
      about,
      avatar,
    }))
    .then((user) => {
      res.status(201).send({
        _id: user._id,
        email: user.email,
        name: user.name,
        about: user.about,
        avatar: user.avatar,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Переданы некорректные данные при создании пользователя');
      } else if (err.code === 11000) {
        throw new AlreadExistsErr('Данный емайл уже зарегистрирован');
      }
      next(err);
    })
    .catch(next);
};

exports.login = (req, res, next) => { // аутентификация(вход на сайт) пользователя
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
  // return User.findOne({ email }).select('+password')
    .then((user) => { // аутентификация успешна! пользователь в переменной user
      // создадим токен
      // eslint-disable-next-line no-unused-vars
      const token = jwt.sign({ _id: user._id }, 'super-strong-secret', { expiresIn: '7d' });
      // вернём токен
      res.send({ token });
    })
    .catch(() => {
      throw new AuthorizationError('Неправильные логин или пароль');
    })
    .catch(next);
};

exports.getUsersMe = (req, res, next) => User.findById(req.user._id)
  .orFail(new Error('NotValididId'))
  .then((user) => res.send(user))
  .catch((err) => {
    if (err.message === 'NotValididId') {
      throw new AuthorizationError('Пользователь по указанному _id не найден');
    } else if (err.name === 'CastError') {
      throw new AuthorizationError('Передан некорректный _id при поиске пользователя');
    }
    next(err);
  })
  .catch(next);

exports.getUsers = (req, res, next) => User.find({})
  .then((users) => res.send({ data: users }))
  .catch(() => {
    throw new Error('При получении списка пользователей произошла ошибка');
  })
  .catch(next);

exports.getUserById = (req, res, next) => User.findById(req.params.userId)
  .orFail(new Error('NotValididId'))
  .then((user) => res.send(user))
  .catch((err) => {
    if (err.message === 'NotValididId') {
      throw new NotFoundError('Пользователь с указанным _id не найден');
    } else if (err.name === 'CastError') {
      throw new BadRequestError('Передан некорректный _id при поиске пользователя');
    }
    next(err);
  })
  .catch(next);

exports.updateUserProfile = (req, res, next) => {
  const { name, about } = req.body;
  const myId = req.user._id;

  if (name && about) {
    User.findByIdAndUpdate(myId, { name, about }, { new: true, runValidators: true })
      .orFail(new Error('NotValididId'))
      .then((user) => res.send(user))
      .catch((err) => {
        if (err.message === 'NotValididId' || err.name === 'CastError') {
          throw new NotFoundError('Пользователь с указанным _id не найден');
        } else if (err.name === 'ValidationError') {
          throw new BadRequestError('Переданы некорректные данные при обновлении профиля');
        }
        next(err);
      })
      .catch(next);
  } else {
    throw new BadRequestError('Переданы некорректные данные при обновлении профиля');
  }
};

exports.updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;
  const myId = req.user._id;

  if (avatar) {
    User.findByIdAndUpdate(myId, { avatar }, { new: true, runValidators: true })
      .orFail(new Error('NotValididId'))
      .then((user) => res.send(user))
      .catch((err) => {
        if (err.message === 'NotValididId' || err.name === 'CastError') {
          throw new NotFoundError('Пользователь с указанным _id не найден');
        } else if (err.name === 'ValidationError') {
          throw new BadRequestError('Переданы некорректные данные при обновлении профиля');
        }
        next(err);
      })
      .catch(next);
  } else {
    throw new BadRequestError('Переданы некорректные данные при обновлении профиля');
  }
};

exports.nonExistingPath = (req, res, next) => {
  throw new NotFoundError('Неправильный путь')
    .catch(next);
};
