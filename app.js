const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');// здесь обрабатываем ошибки валидации celebrate
const userRouter = require('./src/routes/users');
const cardRouter = require('./src/routes/cards');

// Слушаем 3000 порт
const { PORT = 3000 } = process.env;
const app = express();

// добавляем bodyParser по-новому
app.use(express.json());

// подключаем роутер
app.use('/', cardRouter);
app.use('/', userRouter);
// обработчик ошибок celebrate
app.use(errors());
// здесь обрабатываем все ошибки
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'На сервере произошла ошибка' : err.message;
  res.status(statusCode).send({ message });
  next();
});

(async function main() {
  await mongoose.connect('mongodb://localhost:27017/mestodb');
  console.log('Connected to db');

  app.listen(PORT);
  console.log(`App listening on ${PORT}`);
}());
