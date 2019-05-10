const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator/check');
const config = require('config');
const jwtSecret = config.get('jwtSecret');

const User = require('../../models/User');

//@route  Post api/users
//@desc   Registrar User
//@access Public
router.post(
  '/',
  [
    check('name', 'Nome é obrigatório')
      .not()
      .isEmpty(),
    check('email', 'email é obrigatório').isEmail(),
    check('password', 'A senha deve ter mais que 5 caracteres').isLength({
      min: 5
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    try {
      //ver se user existe
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Usuário já cadastrado' }] });
      }
      //pegar o gravatar
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm'
      });

      user = new User({
        name,
        email,
        avatar,
        password
      });

      //criptografar password com bcrypt
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
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
