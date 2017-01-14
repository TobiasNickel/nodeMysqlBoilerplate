var logger = require('log4js').getLogger('{server}{webServer.js}');
var authService = require('../service/authService');

var Koa = require('koa');
var route = require('koa-route');
var router = new Koa();
module.exports = router;

router.use(route.get('/register', async function(ctx, next) {
    await ctx.render('register');
}));

router.use(route.post('/register', function(ctx) {
    ctx.body = 'handle register';
    return Promise.resolve('done');
    var req = ctx.req;
    if (req.body.password != req.body.passwordRepeat) {
        return ctx.render('register', {
            error: 'repeated password does not match'
        });
    }
    return authService.register({
        name:req.body.name,
        mail: req.body.mail,
        password: req.body.password
    })
    .then(function(user){
        req.session.user = user;
        ctx.redirect('/auth/dashboard');
    })
    .catch(function(err){
        return ctx.render('register.ejs', {
            error: 'could not register:'+err.message
        });
    });
}));

router.use(route.get('/login', async function(req, res) {
    await res.render('login');
}));

router.use(route.post('/login', function(ctx, res) {
    var req = ctx.req;
    return authService.validateLogin({mail:req.body.mail, password: req.body.password})
    .then(function(user){
        req.session.user = user;
        res.render('dashboard');
    })
    .catch((err)=>{
        res.render('login', {error: err.message});
    });
}));

router.use(route.get('/dashboard', function(req, res) {
    console.log('',req.session);
    res.render('dashboard', {});
}));

router.use(route.get('/logout', function(ctx) {
    delete ctx.session.user;
    ctx.redirect('/');
}));