const Card = require('../models/card');

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
        res.status(400).send({ Message: 'Переданы некорректные данные при создании карточки' });
      } else {
        res.status(500).send({ Message: `При создании карточки произошла ошибка ${err.name} с сообщением ${err.message}` });
      }
    });
};

exports.getCards = (req, res) => Card.find({})
  .populate(['owner'])
  .then((cards) => res.send({ data: cards }))
  .catch((err) => res.status(500).send({ message: `Произошла ошибка получения списка карточек. ${err.name} / ${err.message}` }));

exports.deleteCard = (req, res) => Card.findByIdAndRemove(req.params.cardId)
  .then((card) => res.status(200).send(card))
  .catch((err) => {
    if (err.name === 'CastError') {
      res.status(404).send({ Message: 'Карточка с указанным _id не найдена.' });
    } else {
      res.status(500).send({ Message: `В процессе удаления карточки произошла ошибка ${err.name} с сообщением ${err.message}` });
    }
  });

exports.likeCard = (req, res) => {
  const myId = req.user._id;
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: myId } }, // $addToSet - добавить элемент в массив, если его там ещё нет(только для монго), $pull чтобы убрать;
    { new: true },
  )
  .orFail(new Error('NotValididId'))
  .then((user) => res.status(200).send(user))
  .catch((err) => {
    if (err.message === 'NotValididId') {
      res.status(404).send({ Message: 'Передан несуществующий _id карточки.' });
    }
    if (err.name === 'CastError') {
      res.status(400).send({ Message: 'Переданы некорректные данные для постановки лайка.' });
    } else {
      res.status(500).send({ Message: `Ошибка по умолчанию ${err.name} с сообщением ${err.message}` });
    }
  })
}

exports.dislikeCard = (req, res) => {
  const myId = req.user._id;
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: myId } }, // см. выше
    { new: true },
  )
  .orFail(new Error('NotValididId'))
  .then((user) => res.status(200).send(user))
  .catch((err) => {
    if (err.message === 'NotValididId') {
      res.status(404).send({ Message: 'Передан несуществующий _id карточки.' });
    }
    if (err.name === 'CastError') {
      res.status(400).send({ Message: 'Переданы некорректные данные для снятия лайка.' });
    } else {
      res.status(500).send({ Message: `Ошибка по умолчанию ${err.name} с сообщением ${err.message}` });
    }
  })
};
