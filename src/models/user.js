const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {},
  password: {
    type: String,
    required: true,
    select: false, // Так по умолчанию хеш пароля пользователя не будет возвращаться из базы.
  },
  name: {},
  about: {},
  avatar: {},
});

// аутентификация пользователя
// добавим метод findUserByCredentials схеме пользователя
// у него будет два параметра — почта и пароль
userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password') // проверим, есть ли пользователь в базе
    .then((user) => {
      if (!user) { // пользователь с такой почтой не найден
        return Promise.reject(new Error('Неправильные почта или пароль')); // отклоняем промис с ошибкой и переходим в блок catch
      }
      // Если пользователь найден, проверим присланный пароль -
      // сравним с паролем данного пользователя в баще
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new Error('Неправильные почта или пароль')); // хеши не совпали — отклоняем промис
          }
          return user; // теперь user доступен
        });
    });
};

// создаём модель и экспортируем её
module.exports = mongoose.model('user', userSchema);
