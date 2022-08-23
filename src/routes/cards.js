const router = require('express').Router();
const auth = require('../../middlewares/auth');

const {
  createCard,
  getCards,
  deleteCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

router.post('/cards', auth, createCard);
router.get('/cards', auth, getCards);
router.delete('/cards/:cardId', auth, deleteCard);
router.put('/cards/:cardId/likes', likeCard);
router.delete('/cards/:cardId/likes', dislikeCard);

module.exports = router;
