const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const auth = require('../../middlewares/auth');

const {
  createUser,
  login,
  getUsersMe,
  getUsers,
  getUserById,
  updateUserProfile,
  updateUserAvatar,
  nonExistingPath,
} = require('../controllers/users');

router.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    password: Joi.string().min(8),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/),
  }).unknown(true),
}), createUser); // регистрация пользователя

router.post('/signin', login); // аутентификация(вход на сайт) пользователя
router.get('/users/me', auth, getUsersMe); // возвращает информацию о текущем пользователе
router.get('/users', auth, getUsers);
router.get('/users/:userId', auth, celebrate({
  body: Joi.object().keys({
    userId: Joi.string()
      .length(24)
      .hex()
      .required(),
    // title: Joi.string().required().min(2).max(30),
    // text: Joi.string().required().min(2),
  }),
}), getUserById);
router.patch('/users/me', auth, updateUserProfile);
router.patch('/users/me/avatar', auth, updateUserAvatar);

router.patch('/404', nonExistingPath);

module.exports = router;
