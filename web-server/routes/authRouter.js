var logger = require('log4js').getLogger('{server}{webServer.js}');
var authService = require('../service/authService');

var Koa = require('koa');
var route = require('koa-route');
var router = new Koa();
module.exports = router;

router.use(route.get('/register', async function (ctx) {
    await ctx.render('register');
}));

router.use(route.post('/register', async function (ctx) {
    var req = ctx.req;
    var body = ctx.request.body;
    if (body.password != body.passwordRepeat) {
        await ctx.render('register', {
            error: 'repeated password does not match'
        });
        return;
    }
    try{
        console.log('register body',body)
        var user = await authService.register({
            name: body.name,
            mail: body.mail,
            password: body.password
        });
        console.log('new registered user',user);
        ctx.session.userId = user.id;
        ctx.redirect('/auth/dashboard');
    }catch(err){
        await ctx.render('register', {
            error: 'could not register:' + err.message
        });
    }
}));

router.use(route.get('/login', async function (ctx) {
    // console.log('ctx',ctx);
    // console.log('ctx.request',ctx.request);
    // console.log('ctx.session',ctx.session);
    if(ctx.session.userId){
        ctx.redirect('/auth/dashboard');
    }else{
        await ctx.render('login');
    }
}));

router.use(route.post('/login', async function (ctx) {
    var req = ctx.req;
    var body = ctx.request.body;
    try {
        var user = await authService.validateLogin({ mail: body.mail, password: body.password });
        ctx.state.user = user;
        ctx.session.userId = user.id;
        return ctx.redirect('dashboard');
    } catch (err) {
        logger.error(err);
        return ctx.render('login', { error: err.message });
    }
}));

router.use(route.get('/dashboard', async function (ctx) {
    await ctx.render('dashboard', {});
}));

router.use(route.post('/logout', async function (ctx) {
    delete ctx.session.userId;
    ctx.redirect('/');
}));