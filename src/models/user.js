const bcrypt = require('bcryptjs');
// const isEmail = require('validator/lib/isEmail');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    // type: String,
    // unique: true,
    // required: true, // оно должно быть у каждого пользователя, так что имя — обязательное поле
    // validate: {
    //   validator: (v) => isEmail(v),
    //   message: 'Неправильный формат почты',
    // },
  },
  password: {
    type: String,
    required: true,
    select: false, // Так по умолчанию хеш пароля пользователя не будет возвращаться из базы.
    // validate: {
    //   validator: (v) => isLength(v, { min: 5, max: 10 }),
    //   message: 'Неправильный формат пароля',
    // },
  },
  name: { // у пользователя есть имя — опишем требования к имени в схеме:
  //  type: String, // имя — это строка
  //  default: 'Жак-Ив Кусто', // значение по умолчанию
  },
  about: {
  //  type: String,
  //  default: 'Исследователь',
  },
  avatar: {
  //  type: String,
  //  default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
  },
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

      // eslint-disable-next-line no-undef, max-len
      return bcrypt.compare(password, user.password) // Если пользователь найден, проверим присланный пароль - сравним с паролем данного пользователя в баще
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new Error('Неправильные почта или пароль')); // хеши не совпали — отклоняем промис
          }

          return user; // теперь user доступен
          // аутентификация успешна
          // res.send({ "token": "Здесь нужно отправить токен, но мы ещё ..." });
        });
    });
};

// создаём модель и экспортируем её
module.exports = mongoose.model('user', userSchema);
