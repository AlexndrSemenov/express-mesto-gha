const bcrypt = require('bcryptjs'); // импортируем bcrypt
const jwt = require('jsonwebtoken'); // импортируем модуль jsonwebtoken
const User = require('../models/user');
const BadRequestError = require('../errors/bad-request-err'); // 400
const NotFoundError = require('../errors/not-found-err'); // 404
const AlreadExistsErr = require('../errors/already-exists-err'); // 409
const AuthorizationError = require('../errors/authorization-err'); // 401

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
        next(new BadRequestError('Переданы некорректные данные при создании пользователя'));
      } else if (err.code === 11000) {
        next(new AlreadExistsErr('Данный емайл уже зарегистрирован'));
      } else {
        next(err);
      }
    });
};

exports.login = (req, res, next) => { // аутентификация(вход на сайт) пользователя
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => { // аутентификация успешна! пользователь в переменной user
      // создадим токен
      const token = jwt.sign({ _id: user._id }, 'super-strong-secret', { expiresIn: '7d' });
      // вернём токен
      res.send({ token });
    })
    .catch(() => {
      next(new AuthorizationError('Неправильные логин или пароль'));
    });
};

exports.getUsersMe = (req, res, next) => User.findById(req.user._id)
  .orFail(new Error('NotValididId'))
  .then((user) => res.send(user))
  .catch((err) => {
    if (err.message === 'NotValididId') {
      next(new NotFoundError('Пользователь по указанному _id не найден'));
    } else {
      next(err);
    }
  });

exports.getUsers = (req, res, next) => User.find({})
  .then((users) => res.send({ data: users }))
  .catch(next);

exports.getUserById = (req, res, next) => User.findById(req.params.userId)
  .orFail(new Error('NotValididId'))
  .then((user) => res.send(user))
  .catch((err) => {
    if (err.message === 'NotValididId') {
      next(new NotFoundError('Пользователь с указанным _id не найден'));
    } else {
      next(err);
    }
  });

exports.updateUserProfile = (req, res, next) => {
  const { name, about } = req.body;
  const myId = req.user._id;
  User.findByIdAndUpdate(myId, { name, about }, { new: true, runValidators: true })
    .orFail(new Error('NotValididId'))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.message === 'NotValididId') {
        next(new NotFoundError('Пользователь с указанным _id не найден'));
      } else if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
      } else {
        next(err);
      }
    });
};

exports.updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;
  const myId = req.user._id;

  User.findByIdAndUpdate(myId, { avatar }, { new: true, runValidators: true })
    .orFail(new Error('NotValididId'))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.message === 'NotValididId') {
        next(new NotFoundError('Пользователь с указанным _id не найден'));
      } else if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
      } else {
        next(err);
      }
    });
};
