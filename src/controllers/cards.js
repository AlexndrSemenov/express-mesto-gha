const Card = require('../models/card');
const BadRequestError = require('../errors/bad-request-err');
const NotFoundError = require('../errors/not-found-err');
const AlreadExistsErr = require('../errors/already-exists-err');
const AuthorizationError = require('../errors/authorization-err');

const HttpCodes = {
  badRequest: 400,
  notFound: 404,
  internalServerError: 500,
};

exports.createCard = (req, res, next) => {
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
        throw new BadRequestError('Переданы некорректные данные при создании карточки');
      }
      next(err);
    })
    .catch(next);
};

exports.getCards = (req, res, next) => Card.find({})
  .populate(['owner'])
  .then((cards) => res.send({ data: cards }))
  .catch(() => {
    throw new Error('При получении списка пользователей произошла ошибка');
  })
  .catch(next);

exports.deleteCard = (req, res) => {
  const { cardId } = req.params;
  const deletedCard = Card.findById(cardId);
  if (req.user._id === deletedCard.owner.toString()) {
    Card.findByIdAndRemove(req.params.cardId)
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
  } else {
    res.status(HttpCodes.badRequest).send({ message: 'Переданы некорректные данные при удалении карточки.' });
  }
};

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
