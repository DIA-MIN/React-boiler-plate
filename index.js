const express = require('express');
const app = express();
const port = 8080;

const pass = encodeURIComponent('#mns@0327#');

const mongoose = require('mongoose');
mongoose
  .connect(
    `mongodb+srv://diamin:${pass}@myboilerplate.ltxyo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
  `
  )
  .then(() => console.log('MongoDB Connected...'))
  .catch((err) => console.log(err));

app.get('/', (req, res) => res.send('Hello World! Review Start!'));

app.listen(port, () => console.log(`Example ${port}`));
