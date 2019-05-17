const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator/check');

const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route  POST api/posts
//@desc   Adicionar Post
//@access Private
router.post('/', [auth, [
  check('text', 'Texto é obrigatório').not().isEmpty(),
]], async (req, res) => {
  const errors = validationResult(req);

  if(!errors.isEmpty()){
    return  res.status(400).json({errors: errors.array()})
  }

  try {

    const user = await User.findById(req.user.id).select('-password');

    const newPost = new Post({
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id
    });
    const post = await newPost.save();
    res.json(post);
    
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Erro de servidor!');
  }
});

//@route  GET api/posts
//@desc   Pegar todos os posts
//@access Private
router.get('/', auth, async (req, res) => {
  try {

    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
    
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erro de servidor!')
  }
});

//@route  GET api/posts/:post_id
//@desc   Pegar posts por id
//@access Private
router.get('/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    if(!post){
      return res.status(400).json({msg: 'Post não encontrado!'});
    }
    res.json(post);
    
  } catch (error) {
    console.error(error.message);
    if(error.kind === 'ObjectId'){
      return res.status(400).json({msg: 'Post não encontrado!'});
    }
    res.status(500).send('Erro de servidor!')
  }
});

//@route  DELETE api/posts/:post_id
//@desc   deletar post
//@access Private
router.delete('/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);

    if(!post){
      return res.status(400).json({msg: 'Post não encontrado!'});
    }
    //verificar se user do post é o dono
    if(post.user.toString() !== req.user.id){
      return res.status(401).json({ msg: 'Usuário não autorizado!' })
    }
    await post.remove();
    res.json({ msg: 'Post removido!' })
    
  } catch (error) {
    console.error(error.message);
    if(error.kind === 'ObjectId'){
      return res.status(400).json({msg: 'Post não encontrado!'});
    }
    res.status(500).send('Erro de servidor!')
  }
});

//@route  PUT api/posts/like/:post_id
//@desc   Atualizar post (likes)
//@access Private
router.put('/like/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    //verificar se aquele user já deu like
    if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
      return res.status(400).json({ msg: 'User já curtiu o post!' })
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes)

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erro de servidor!');
  }
});

//@route  PUT api/posts/unlike/:post_id
//@desc   Atualizar post (unlikes)
//@access Private
router.put('/unlike/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    //verificar se aquele user já deu like
    if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
      return res.status(400).json({ msg: 'Post ainda não foi curtido!' })
    }
    //pegar index do post que será removido
    const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);
    await post.save();
    res.json(post.likes);

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erro de servidor!');
  }
});

//@route  POST api/posts/comment/:post_id
//@desc   Comentar em um post
//@access Private
router.post('/comment/:post_id', [auth, [
  check('text', 'Texto é obrigatório').not().isEmpty(),
]], async (req, res) => {
  const errors = validationResult(req);

  if(!errors.isEmpty()){
    return  res.status(400).json({errors: errors.array()})
  }

  try {

    const user = await User.findById(req.user.id).select('-password');
    const post = await Post.findById(req.params.post_id);

    const newComment = {
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id
    };

    post.comments.unshift(newComment);

    await post.save();
    res.json(post.comments);
    
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Erro de servidor!');
  }
});

//@route  DELETE api/posts/comment/:post_id/:comment_id
//@desc   Deletar um comentário
//@access Private
router.delete('/comment/:post_id/:comment_id', auth, async (req, res) => {
  try {

    const post = await Post.findById(req.params.post_id);
    //pegar o comentário dentro do post
    const comment = post.comments.find(comment => comment.id === req.params.comment_id);
    //checar se comentário existe
    if(!comment){
      return res.status(404).json({ msg: 'Comentário não existe' });
    }
    //checar se quem vai deletar é o dono do comentário
    if(comment.user.toString() !== req.user.id) {
      return res.status(404).json({ msg: 'Usuário não autorizado!' });
    }

    //pegar index do post que será removido
    const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);

    post.comments.splice(removeIndex, 1);
    await post.save();
    res.json(post.comments);
    
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Erro de servidor!');
  }
})


module.exports = router;
