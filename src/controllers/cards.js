const Card = require('../models/card');
const BadRequestError = require('../errors/bad-request-err'); // 400
const NotFoundError = require('../errors/not-found-err'); // 404
const AnotherCardErr = require('../errors/another-card-err'); // 403

exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.status(201).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при создании карточки'));
      } else {
        next(err);
      }
    });
};

exports.getCards = (req, res, next) => Card.find({})
  .populate(['owner'])
  .then((cards) => res.send({ data: cards }))
  .catch(next);

module.exports.deleteCard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { cardId } = req.params;
    const deletedCard = await Card.findById(cardId);
    if (deletedCard) {
      if (deletedCard.owner.toString() === userId) {
        Card.findByIdAndRemove(req.params.cardId)
          .then((card) => res.send(card))
          .catch(next);
      } else {
        next(new AnotherCardErr('Невозможно удалить чужую карточку'));
      }
    } else {
      next(new NotFoundError('Передан некорректный id карточки'));
    }
  } catch (err) { next(err); }
};

exports.likeCard = (req, res, next) => {
  const myId = req.user._id;
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: myId } }, // добавить элемент в массив, еслиеготамещёнет(только для монго)
    { new: true },
  )
    .orFail(() => new NotFoundError('При постановке лайка передан несуществующий _id карточки'))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные для постановки лайка'));
      } else {
        next(err);
      }
    });
};

exports.dislikeCard = (req, res, next) => {
  const myId = req.user._id;
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: myId } }, // см. выше
    { new: true },
  )
    // orFail также как и здесь можно сделать в controllers - users.js
    .orFail(() => new NotFoundError('При удалении лайка передан несуществующий _id карточки'))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные для снятия лайка'));
      } else {
        next(err);
      }
    });
};
