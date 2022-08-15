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

// подключаем роутер
app.use('/', cardRouter);
app.use('/', userRouter);

async function main() {
  await mongoose.connect('mongodb://localhost:27017/mestodb');
  console.log('Connected to db');

  app.listen(PORT);
  console.log(`App listening on ${PORT}`);
}
main();