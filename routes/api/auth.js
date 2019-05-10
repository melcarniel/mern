const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator/check');
const config = require('config');
const jwtSecret = config.get('jwtSecret');

const User = require('../../models/User');

//@route  GET api/auth
//@access Public
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erro no servidor!');
  }
});

//@route  Post api/auth
//@desc   Autenticar usuário e pegar token
//@access Public
router.post(
  '/',
  [
    check('email', 'email é obrigatório').isEmail(),
    check('password', 'A senha é obrigatória').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      //ver se user existe
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Usuário ou senha incorretos!' }] });
      }

      const isMatch = bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Usuário ou senha incorretos!' }] });
      }

      //retornar jsonwebtoken
      const payload = {
        user: {
          id: user.id
        }
      };
      jwt.sign(payload, jwtSecret, { expiresIn: 3600 }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } catch (error) {
      console.erro(error.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
