const mongoose = require('mongoose');
const config = require('config');

const db = config.get('mongoURI');

const connectDB = async () => {
  try {
    await mongoose.connect(db, { useNewUrlParser: true });
    console.log('MongoDB conectado!');
  } catch (error) {
    console.log(error.message);
    //sair se o processo falhar
    process.exit(1);
  }
};

module.exports = connectDB;
