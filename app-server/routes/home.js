var express = require('express');
var router = express.Router();

var axios = require('axios');
var moment = require('moment')

var aux = require('./functions')

router.get('/', function(req, res) {
  if (!req.cookies.token) aux.gerarTokenConsumidor(req.originalUrl, res)
  else {
    axios.get('http://localhost:8001/noticias?token=' + req.cookies.token)
      .then(dados => {
        var noticias = [];
          
        dados.data.forEach(n => {
          var not = `${moment(n.data).format('HH:mm:ss, DD-MM-YYYY')}`
          not += `<p>O produtor <a href="/perfil/${n.idAutor}">${n.nomeAutor}</a> disponibilizou ${n.recursos.length > 1 ? 'os seguintes recursos' : 'o seguinte recurso'}: <ul>`
          n.recursos.forEach(r => not += `<li> <a href="/recursos/${r.id}">${r.titulo}</a> (${r.tipo})`)
          not += `</ul></p><hr>`

          noticias.push(not)
        })

        var token = aux.unveilToken(req.cookies.token)
          
        axios.get('http://localhost:8001/recursos/tipos?token=' + req.cookies.token)
          .then(tipos => res.render('home', {nivel: token.nivel, noticias, tipos: tipos.data}))
          .catch(error => res.render('error', {error}))
      })
      .catch(error => res.render('error', {error}))
  }
});

module.exports = router;
