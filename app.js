const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const userRouter = require('./src/routes/users');
const cardRouter = require('./src/routes/cards');

// Слушаем 3000 порт
const { PORT = 3000 } = process.env;
const app = express();

// добавляем bodyParser по-новому
app.use(express.json());

// временное решение для реализации передачи id пользователя при создании карточки
app.use((req, res, next) => {
  req.user = {
    _id: '62ee6211b9d59df857a5c077',
  };
  next();
});
//_id: '62ee6211b9d59df857a5c077',
// подключаем роутер
app.use('/', cardRouter);
app.use('/', userRouter);

app.use(express.static(path.join(__dirname, 'public')));

async function main() {
  await mongoose.connect('mongodb://localhost:27017/mestodb');
  console.log('Connected to db');

  app.listen(PORT);
  console.log(`App listening on ${PORT}`);
}
main();

// подключаемся к серверу mongo
// Этот метод принимает на вход 2 параметра: адрес сервера базы данных и объект опций. Адрес состоит из двух частей. Первая — mongodb://localhost:27017 — адрес сервера mongo по умолчанию. Он запускается на localhost на 27017 порту. Вторая часть — mestodb — имя базы данных.
// mongoose.connect('mongodb://localhost:27017/mestodb', {
//   useNewUrlParser: true
// });

// app.use((req, res, next) => {
//   console.log(`${req.method} : ${req.path} : ${JSON.stringify(req.body)}`);
//   next();
// });

// app.listen(PORT, () => {
//   console.log(`App lissten on port ${PORT}`);
// });
