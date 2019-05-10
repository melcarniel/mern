const express = require('express');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

//conectar banco
connectDB();

//Middleware
//body-parser
app.use(express.json({ extended: false }));

app.get('/', (req, res) => {
  res.send('API no ar!');
});

//Rotas
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));

app.listen(PORT, () => {
  console.log(`Servidor no ar na porta ${PORT}`);
});
