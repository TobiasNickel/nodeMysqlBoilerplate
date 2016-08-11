var userDao = require('../dao/userDao');
var authService = require('../service/authService');

var router = require('express').Router();
module.exports = router;

router.get('/register', function(req, res) {
    res.render('register.jade');
});

router.post('/register', function(req, res) {
    if (req.body.password != req.body.passwordRepeat) {
        res.render('register.jade', {
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
        res.render('register.jade', {
            error: 'could not register:'+err.message
        });
    });
});

router.get('/login', function(req, res) {
    res.render('login.jade', {});
});

router.post('/login', function(req, res) {
    authService.validateLogin({mail:req.body.mail, password: req.body.password})
    .then(function(user){
        req.session.user = user;
        res.render('dashboard.jade');
    })
    .catch((err)=>{
        res.render('login.jade', {error:'wrong login'});
    });
});

router.get('/dashboard', function(req, res) {
    console.log('',req.session)
    res.render('dashboard.jade', {});
});

router.get('/logout', function(req, res) {
    delete req.session.user;
    res.redirect('/')
});