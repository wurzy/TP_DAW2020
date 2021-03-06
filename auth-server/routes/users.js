var jwt = require('jsonwebtoken');
var passport = require('passport');
var express = require('express');
var router = express.Router();

var User = require('../controllers/user');

// listar utilizadores
router.get('/', function(req, res, next) {
  User.listar()
    .then(dados => res.status(200).jsonp({users: dados}))
    .catch(error => res.status(500).jsonp({error}))
});

router.get('/consumidor', function(req, res) {
  jwt.sign({
    nivel: 'consumidor',
    sub: 'TP_DAW2020'}, 
    "TP_DAW2020",
    {expiresIn: "1h"},
    function(e, token) {
      if(e) res.status(500).jsonp({error: "Erro na geração do token de consumidor: " + e}) 
      else res.status(201).jsonp({token})
  })
})

// inserir novo utilizador
router.post('/', function(req, res) {
  User.inserir(req.body)
    .then(dados => res.status(201).jsonp({dados}))
    .catch(error => res.status(500).jsonp({error}))
})

// login de utilizador
router.post('/login', passport.authenticate('login-auth'), function(req, res) {
  if (req.user.success && req.user.user.bloqueado == false) {
    jwt.sign({
      _id: req.user.user._id,
      nome: req.user.user.nome,
      nivel: req.user.user.nivel,
      sub: 'TP_DAW2020'}, 
      "TP_DAW2020",
      {expiresIn: "1d"},
      function(e, token) {
        if(e) res.status(500).jsonp({error: "Erro na geração do token: " + e}) 
        else res.status(201).jsonp({token})
    })
  }
  else res.status(201).jsonp({invalidInput: req.user.invalidInput, error: req.user.message}) 
})

// login de utilizador
router.post('/signup', passport.authenticate('signup-auth'), function(req, res) {
  if (req.user.success) {
    jwt.sign({
      email: req.user.user.email, 
      nivel: req.user.user.nivel,
      _id: req.user.user._id,
      sub: 'TP_DAW2020'}, 
      "TP_DAW2020",
      {expiresIn: "1d"},
      function(e, token) {
        if(e) res.status(500).jsonp({error: "Erro na geração do token: " + e}) 
        else res.status(201).jsonp({token})
    })
  }
  else res.status(201).jsonp({invalidInput: req.user.invalidInput, error: req.user.message}) 
})

module.exports = router;
