const User = require('../models/user');

exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: `Переданы некорректные данные при создании пользователя ${err.name} с сообщением ${err.message}` });
      } else {
        res.status(500).send({ message: `При создании пользователя произошла ошибка ${err.name} с сообщением ${err.message}` });
      }
    });
}

exports.getUsers = (req, res) => User.find({})
  .then((users) => res.send({ data: users }))
  .catch((err) => res.status(500).send({ message: `При получении списка пользователей произошла ошибка ${err.name} с сообщением ${err.message}` }));

exports.getUserById = (req, res) => User.findById(req.params.userId)
  .orFail(new Error('NotValididId'))
  .then((user) => res.status(200).send(user))
  .catch((err) => {
    if (err.message === 'NotValididId') {
      res.status(404).send({ message: 'Пользователь по указанному _id не найден.' });
    } else {
      res.status(500).send({ message: `В процессе поиска пользователя произошла ошибка ${err.name} с сообщением ${err.message}` });
    }
  });

exports.updateUserProfile = (req, res) => {
  const { name, about } = req.body;
  const myId = req.user._id;

  if(name && about) {
    User.findByIdAndUpdate(myId, { name, about }, {new: true, runValidators: true})
    .orFail(new Error('NotValididId'))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.message === 'NotValididId' || err.name === 'CastError') {
        res.status(404).send({ message: 'Пользователь с указанным _id не найден.' });
      }
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Переданы некорректные данные при обновлении профиля' });
      } else {
        res.status(500).send({ message: `В процессе обновления данных пользователя произошла ошибка ${err.name} с сообщением ${err.message}` });
      }
    });

  } else {
    res.status(400).send({ message: 'Переданы некорректные данные при обновлении профиля' });
  }
}

exports.updateUserAvatar = (req, res) => {
  const { avatar } = req.body;
  const myId = req.user._id;

  if(avatar) {
    User.findByIdAndUpdate(myId, { avatar }, {new: true, runValidators: true})
    .orFail(new Error('NotValididId'))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.message === 'NotValididId' || err.name === 'CastError') {
        res.status(404).send({ message: 'Пользователь с указанным _id не найден.' });
      }
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Переданы некорректные данные при обновлении аватара' });
      } else {
        res.status(500).send({ message: `В процессе обновления аватарки произошла ошибка ${err.name} с сообщением ${err.message}` });
      }
    })

  } else {
    res.status(400).send({ message: 'Переданы некорректные данные при обновлении аватара' });
  }
}