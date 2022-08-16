const router = require('express').Router();

const {
  createUser,
  getUsers,
  getUserById,
  updateUserProfile,
  updateUserAvatar,
  nonExistingPath,
} = require('../controllers/users');

router.post('/users', createUser);
router.get('/users', getUsers);
router.get('/users/:userId', getUserById);
router.patch('/users/me', updateUserProfile);
router.patch('/users/me/avatar', updateUserAvatar);

router.patch('/404', nonExistingPath);

module.exports = router;
