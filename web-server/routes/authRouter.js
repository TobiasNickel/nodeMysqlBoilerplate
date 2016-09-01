var userDao = require('../dao/userDao');
var authService = require('../service/authService');

var router = require('express').Router();
module.exports = router;

router.get('/register', function(req, res) {
    res.render('register.ejs');
});

router.post('/register', function(req, res) {
    if (req.body.password != req.body.passwordRepeat) {
        res.render('register.ejs', {
            error: 'repeated password does not match'
        })
        return;
    }
    authService.register({
        name:req.body.name,
        mail: req.body.mail,
        password: req.body.password
    })
    .then(function(user){
        req.session.user = user;
        res.redirect('/auth/dashboard');
    })
    .catch(function(err){
        console.log(err)
        res.render('register.ejs', {
            error: 'could not register:'+err.message
        });
    });
});

router.get('/login', function(req, res) {
    res.render('login.ejs', {});
});

router.post('/login', function(req, res) {
    authService.validateLogin({mail:req.body.mail, password: req.body.password})
    .then(function(user){
        req.session.user = user;
        res.render('dashboard.ejs');
    })
    .catch((err)=>{
        res.render('login.ejs', {error:'wrong login'});
    });
});

router.get('/dashboard', function(req, res) {
    console.log('',req.session)
    res.render('dashboard.ejs', {});
});

router.get('/logout', function(req, res) {
    delete req.session.user;
    res.redirect('/')
});