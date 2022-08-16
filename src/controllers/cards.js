const Card = require('../models/card');

const HttpCodes = {
  badRequest: 400,
  notFound: 404,
  internalServerError: 500,
};

exports.createCard = (req, res) => {
  const {
    name, link, likes, createdAt,
  } = req.body;
  const owner = req.user._id;

  Card.create({
    name, link, owner, likes, createdAt,
  })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(HttpCodes.badRequest).send({ message: 'Переданы некорректные данные при создании карточки' });
      } else {
        res.status(HttpCodes.internalServerError).send({ message: `При создании карточки произошла ошибка ${err.name} с сообщением ${err.message}` });
      }
    });
};

exports.getCards = (req, res) => Card.find({})
  .populate(['owner'])
  .then((cards) => res.send({ data: cards }))
  .catch((err) => res.status(HttpCodes.internalServerError).send({ message: `Произошла ошибка получения списка карточек. ${err.name} / ${err.message}` }));

exports.deleteCard = (req, res) => Card.findByIdAndRemove(req.params.cardId)
  .orFail(new Error('NotValididId'))
  .then((card) => res.send(card))
  .catch((err) => {
    if (err.message === 'NotValididId') {
      res.status(HttpCodes.notFound).send({ message: 'Карточка с указанным _id не найдена.' });
    } else if (err.name === 'CastError') {
      res.status(HttpCodes.badRequest).send({ message: 'Переданы некорректные данные при удалении карточки.' });
    } else {
      res.status(HttpCodes.internalServerError).send({ message: `В процессе удаления карточки произошла ошибка ${err.name} с сообщением ${err.message}` });
    }
  });

exports.likeCard = (req, res) => {
  const myId = req.user._id;
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: myId } }, // добавить элемент в массив, еслиеготамещёнет(только для монго)
    { new: true },
  )
    .orFail(new Error('NotValididId'))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.message === 'NotValididId') {
        res.status(HttpCodes.notFound).send({ message: 'Передан несуществующий _id карточки.' });
      } else if (err.name === 'CastError') {
        res.status(HttpCodes.badRequest).send({ message: 'Переданы некорректные данные для постановки лайка.' });
      } else {
        res.status(HttpCodes.internalServerError).send({ message: `Ошибка по умолчанию ${err.name} с сообщением ${err.message}` });
      }
    });
};

exports.dislikeCard = (req, res) => {
  const myId = req.user._id;
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: myId } }, // см. выше
    { new: true },
  )
    .orFail(new Error('NotValididId'))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.message === 'NotValididId') {
        res.status(HttpCodes.notFound).send({ message: 'Передан несуществующий _id карточки.' });
      } else if (err.name === 'CastError') {
        res.status(HttpCodes.badRequest).send({ message: 'Переданы некорректные данные для снятия лайка.' });
      } else {
        res.status(HttpCodes.internalServerError).send({ message: `Ошибка по умолчанию ${err.name} с сообщением ${err.message}` });
      }
    });
};
