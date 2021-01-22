var express = require('express');
var router = express.Router();

var jwt = require('jsonwebtoken')
var keyToken = "TP_DAW2020"

var axios = require('axios');
var fs = require('fs')

var multer = require('multer')

var storage = multer.diskStorage({
  destination: (req,file,cb) => {
    cb(null, "../uploads/imagens/")
  },
  filename: (req,file,cb) => {
    cb(null, new Date().toISOString() + file.originalname)
  }
})
var upload = multer({storage: storage})

function unveilToken(token){  
  var t = null;
  jwt.verify(token,keyToken,function(e,decoded){
    if(e){
      console.log('Erro: ' + e)
      t = null
    }
    else{
      return t = decoded
    } 
  })
  return t
}


router.get('/login', function(req, res) {
  res.render('login');
})

router.get('/signup', function(req, res) {
  res.render('signup');
})

router.get('/logout', function(req, res) {
  res.clearCookie("token");
  res.redirect('/');
})

router.post('/login', function(req, res) {
  axios.post('http://localhost:8000/users/login', req.body)
    .then(dados => {
      if (dados.data.token) {
        res.cookie('token', dados.data.token, {
          expires: new Date(Date.now() + '1d'),
          secure: false,
          httpOnly: true
        })

        res.redirect('/recursos')
      }
      else res.render('index', {
        auth: false,
        invalidInput: dados.data.invalidInput,
        email: req.body.email,
        password: req.body.password,
        error_msg: dados.data.error
      })
    })
    .catch(error => res.render('error', {error}))
})

/* GET users listing. */
router.get('/perfil', function(req, res, next) {
  if (!req.cookies.token) res.redirect('/users/login')
  else {
    var token = unveilToken(req.cookies.token)
    axios.get('http://localhost:8001/users/' + token._id +'?token=' + req.cookies.token)
      .then(dados => res.render("user", {user: dados.data}))
      .catch(error => res.render('error', {error}))
  }
});

router.post('/editar/:id/imagem', upload.single('foto'), function(req,res,next){
  console.log("ola")
  console.log(req.file)
})

router.post('/editar/:id', function(req, res, next){
  //req.cookies.token = req.query.token
  if (!req.cookies.token) res.redirect('/users/login')
  else {
    var token = unveilToken(req.cookies.token)
    axios.put('http://localhost:8001/users/' + token._id +'?token=' + req.cookies.token, req.body)
      .then(dados => res.redirect("/users/perfil"))
      .catch(error => res.render('error', {error}))
  }
})

module.exports = router;
