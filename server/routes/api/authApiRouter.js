var userDao = require('../dao/userDao');
var authService = require('../service/authService');

var router = require('express').Router();
module.exports = router;

router.post('/register', function(req, res) {
    authService.register({
        name: req.body.name+'',
        mail: req.body.mail+'',
        password: req.body.password+''
    }).then(function(user){
        req.session.user = user;
        res.json(user);
    }).catch(function(err){
        res.json({
            error: 'could not register:'+err.message
        });
    })
});

router.post('/login', function(req, res) {
    userDao.getOneByMail(req.body.mail).then((user) => {
        if (user && user.password == req.body.password) {
            req.session.user = user;
            res.json(user);
        } else {
            res.render({error: 'wrong login infos'});
        }
    }).catch((err) => {
        res.json({error:'not found'})
    });
});

router.get('/dashboard', function(req, res) {
    res.json(req.session.user);
});

router.post('/logout', function(req, res) {
    delete req.session.user;
    res.redirect('/')
});