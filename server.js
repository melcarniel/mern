const express = require('express');

const app = express();
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('API no ar!');
});

app.listen(PORT, () => {
  console.log(`Servidor no ar na porta ${PORT}`);
});
