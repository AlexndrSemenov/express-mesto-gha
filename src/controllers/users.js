const User = require('../models/user');

const HttpCodes = {
  badRequest: 400,
  notFound: 404,
  internalServerError: 500,
};

exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(HttpCodes.badRequest).send({ message: `Переданы некорректные данные при создании пользователя ${err.name} с сообщением ${err.message}` });
      } else {
        res.status(HttpCodes.internalServerError).send({ message: `При создании пользователя произошла ошибка ${err.name} с сообщением ${err.message}` });
      }
    });
};

exports.getUsers = (req, res) => User.find({})
  .then((users) => res.send({ data: users }))
  .catch((err) => res.status(HttpCodes.internalServerError).send({ message: `При получении списка пользователей произошла ошибка ${err.name} с сообщением ${err.message}` }));

exports.getUserById = (req, res) => User.findById(req.params.userId)
  .orFail(new Error('NotValididId'))
  .then((user) => res.send(user))
  .catch((err) => {
    if (err.message === 'NotValididId') {
      res.status(HttpCodes.notFound).send({ message: 'Пользователь по указанному _id не найден.' });
    } else if (err.name === 'CastError') {
      res.status(HttpCodes.badRequest).send({ message: 'Передан некорректный _id при поиске пользователя' });
    } else {
      res.status(HttpCodes.internalServerError).send({ message: `В процессе поиска пользователя произошла ошибка ${err.name} с сообщением ${err.message}` });
    }
  });

exports.updateUserProfile = (req, res) => {
  const { name, about } = req.body;
  const myId = req.user._id;

  if (name && about) {
    User.findByIdAndUpdate(myId, { name, about }, { new: true, runValidators: true })
      .orFail(new Error('NotValididId'))
      .then((user) => res.send(user))
      .catch((err) => {
        if (err.message === 'NotValididId' || err.name === 'CastError') {
          res.status(HttpCodes.notFound).send({ message: 'Пользователь с указанным _id не найден.' });
        } else if (err.name === 'ValidationError') {
          res.status(HttpCodes.badRequest).send({ message: 'Переданы некорректные данные при обновлении профиля' });
        } else {
          res.status(HttpCodes.internalServerError).send({ message: `В процессе обновления данных пользователя произошла ошибка ${err.name} с сообщением ${err.message}` });
        }
      });
  } else {
    res.status(HttpCodes.badRequest).send({ message: 'Переданы некорректные данные при обновлении профиля' });
  }
};

exports.updateUserAvatar = (req, res) => {
  const { avatar } = req.body;
  const myId = req.user._id;

  if (avatar) {
    User.findByIdAndUpdate(myId, { avatar }, { new: true, runValidators: true })
      .orFail(new Error('NotValididId'))
      .then((user) => res.send(user))
      .catch((err) => {
        if (err.message === 'NotValididId' || err.name === 'CastError') {
          res.status(HttpCodes.notFound).send({ message: 'Пользователь с указанным _id не найден.' });
        } else if (err.name === 'ValidationError') {
          res.status(HttpCodes.badRequest).send({ message: 'Переданы некорректные данные при обновлении аватара' });
        } else {
          res.status(HttpCodes.internalServerError).send({ message: `В процессе обновления аватарки произошла ошибка ${err.name} с сообщением ${err.message}` });
        }
      });
  } else {
    res.status(HttpCodes.badRequest).send({ message: 'Переданы некорректные данные при обновлении аватара' });
  }
};

exports.nonExistingPath = (req, res) => {
  res.status(HttpCodes.notFound).send({ message: 'Неправильный путь' });
};
