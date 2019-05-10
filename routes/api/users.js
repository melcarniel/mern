const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');

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
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    res.send('user route');
  }
);

module.exports = router;
