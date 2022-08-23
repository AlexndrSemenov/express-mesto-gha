const router = require('express').Router();
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

// router.post('/users', createUser);
router.post('/signup', createUser); // регистрация пользователя
router.post('/signin', login); // аутентификация(вход на сайт) пользователя
router.get('/users/me', auth, getUsersMe); // возвращает информацию о текущем пользователе

router.get('/users', auth, getUsers);
router.get('/users/:userId', auth, getUserById);
router.patch('/users/me', auth, updateUserProfile);
router.patch('/users/me/avatar', updateUserAvatar);

router.patch('/404', nonExistingPath);

module.exports = router;
