const Card = require('../models/card');
const BadRequestError = require('../errors/bad-request-err'); // 400
// const NotFoundError = require('../errors/not-found-err'); // 404
// const AlreadExistsErr = require('../errors/already-exists-err'); // 409
const AuthorizationError = require('../errors/authorization-err'); // 401

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

module.exports.deleteCard = async (req, res) => {
  try {
    const userId = req.user._id;
    const { cardId } = req.params;
    const desiredCard = await Card.findById(cardId);
    if (desiredCard.owner.toString() === userId) {
      Card.findByIdAndRemove(req.params.cardId)
        .orFail(new Error('NotValididId'))
        .then((card) => res.send(card))
        .catch((err) => {
          if (err.message === 'NotValididId') {
            throw new AuthorizationError('Карточка с указанным _id не найдена');
          } else if (err.name === 'CastError') {
            throw new AuthorizationError('Переданы некорректные данные при удалении карточки');
          }
          // next(err);
        });
    }
    throw new BadRequestError('Переданы данные при удалении карточки');
  } catch (err) { console.log(err); }
};

// exports.deleteCard = (req, res, next) => {
//   const { cardId } = req.params;
//   const deletedCard = Card.findById(cardId);
//   if (req.user._id === deletedCard.owner.toString()) {
//     Card.findByIdAndRemove(req.params.cardId)
//       .orFail(new Error('NotValididId'))
//       .then((card) => res.send(card))
//       .catch((err) => {
//         if (err.message === 'NotValididId') {
//           throw new AuthorizationError('Карточка с указанным _id не найдена');
//         } else if (err.name === 'CastError') {
//           throw new AuthorizationError('Переданы некорректные данные при удалении карточки');
//         }
//         next(err);
//       });
//   }
//   throw new BadRequestError('Переданы некорректные данные при удалении карточки');
// };

exports.likeCard = (req, res, next) => {
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
        throw new AuthorizationError('При постановке лайка передан несуществующий _id карточки');
      } else if (err.name === 'CastError') {
        throw new AuthorizationError('Переданы некорректные данные для постановки лайка');
      }
      next(err);
    })
    .catch(next);
};

exports.dislikeCard = (req, res, next) => {
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
        throw new AuthorizationError('При постановке лайка передан несуществующий _id карточки');
      } else if (err.name === 'CastError') {
        throw new AuthorizationError('Переданы некорректные данные для постановки лайка');
      }
      next(err);
    })
    .catch(next);
};
