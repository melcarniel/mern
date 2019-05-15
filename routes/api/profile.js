const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator/check');

const Profile = require('../../models/Profile');
const User = require('../../models/User');


//@route  GET api/profile
//@desc   Pegar todos os profiles
//@access Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erro de servidor!');
  }
});

//@route  GET api/profile/user/:user_id
//@desc   Pegar profile por usuário
//@access Public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.user_id}).populate('user', ['name', 'avatar']);
    
    if(!profile) return res.status(400).json({msg: 'Profile não encontrado!'});
    
    res.json(profile);
  } catch (error) {
    console.error(error.message);

    if(error.kind == 'ObjectId') {
      res.status(400).json({msg: 'Profile não encontrado!'});
    }

    res.status(500).send('Erro de servidor!');
  }
});



//@route  GET api/profile/me
//@desc   Pegar um usuário
//@access Private
router.get('/me', auth, async (req, res) => {
  try {
    //req.user.id vem do token
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      'user',
      ['name', 'avatar']
    );

    if (!profile) {
      return res.status(400)
        .json({ msg: 'Não existe perfil para esse usuário!' });
    }

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erro de servidor!');
  }
});

//@route  POST api/profile
//@desc   Criar ou atualizar um profile
//@access Private
router.post('/', [auth, [
  check('status', 'Status é obrigatório').not().isEmpty(),
  check('skills', 'Habilidades é obrigatório!').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req);

  if(!errors.isEmpty()){
    return  res.status(400).json({errors: errors.array()})
  }
  
  const { company, website, location, bio, status, githubusername, 
    skills, youtube, facebook, twitter, instagram, linkedin} = req.body;

  //construir objeto profile
  const profileFields = {};
  profileFields.user = req.user.id;
  if (company) profileFields.company = company;
  if (website) profileFields.website = website;
  if (location) profileFields.location = location;
  if (bio) profileFields.bio = bio;
  if (status) profileFields.status = status;
  if (githubusername) profileFields.githubusername = githubusername;
  if (skills) {
    profileFields.skills = skills.split(',').map(skill => skill.trim());
  }

  //construir array das redes sociais
  profileFields.social = {} //se não inicializar vazia dá erro undefined
  if (youtube) profileFields.social.youtube = youtube;
  if (facebook) profileFields.social.facebook = facebook;
  if (twitter) profileFields.social.twitter = twitter;
  if (instagram) profileFields.social.instagram = instagram;
  if (linkedin) profileFields.social.linkedin = linkedin;
  
  try {
    let profile = await Profile.findOne({user: req.user.id});

    if(profile){
      //update
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id},
        { $set: profileFields},
        { new: true}
      );

      return res.json(profile);
    }

    //else criar
    profile = new Profile(profileFields);

    await profile.save();
    res.json(profile)


  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erro de Servidor!')
  }
 
});

//@route  DELETE api/profile
//@desc   Deletar profile, user e posts
//@access Private
router.delete('/', auth, async (req, res) => {
  try {
    //@todo remover posts
    //remove profile
    await Profile.findOneAndRemove({user: req.user.id});
    //remove user
    await User.findOneAndRemove({_id: req.user.id});

    res.json({msg: 'Usuário removido!'})

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erro de servidor!');
  }
});

//@route  PUT api/profile/experience
//@desc   Atualizar profile experience, education
//@access Private
router.put('/experience', [auth, [
  check('title', 'Título é obrigatório').not().isEmpty(),
  check('company', 'Empresa é obrigatório').not().isEmpty(),
  check('from', 'Início é obrigatório').not().isEmpty()

]], async (req, res) => {
  const errors = validationResult(req);

  if(!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, company, location, from, to, current, description } = req.body;

  const newExperience = {
    //title: title - mesma coisa que colocar só a variável
    title,
    company,
    location,
    from,
    to,
    current,
    description
  }

  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //unshift tem a mesma função do push
    profile.experience.unshift(newExperience);

    await profile.save();

    res.json(profile);

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erro de servidor!');
  }
});

//@route  DELETE api/profile/experience/:exp_id
//@desc   Deletar uma experience
//@access Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    //pegar id da experience
    const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erro de servidor!')
  }
});


module.exports = router;
