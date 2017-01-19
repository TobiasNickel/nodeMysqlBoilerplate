import * as log4js from 'log4js';
import * as authService from '../service/authService';

import * as Koa from 'koa';
import * as route from 'koa-route';

var logger = log4js.getLogger('{server}{webServer.js}');

var router = new Koa();
module.exports = router;

router.use(route.get('/register', async function (ctx) {
    await ctx.render('register');
}));

router.use(route.post('/register', async function (ctx) {
    var body = ctx.request.body;
    if (body.password != body.passwordRepeat) {
        await ctx.render('register', {
            error: 'repeated password does not match'
        });
        return;
    }
    try{
        var user = await authService.register({
            name: body.name,
            mail: body.mail,
            password: body.password
        });
        ctx.session.userId = user.id;
        ctx.redirect('/auth/dashboard');
    }catch(err){
        await ctx.render('register', {
            error: 'could not register:' + err.message
        });
    }
}));

router.use(route.get('/login', async function (ctx) {
    if(ctx.session.userId){
        ctx.redirect('/auth/dashboard');
    }else{
        await ctx.render('login');
    }
}));

router.use(route.post('/login', async function (ctx) {
    var body = ctx.request.body;
    try {
        var user = await authService.validateLogin({ mail: body.mail, password: body.password });
        if(user){
            ctx.state.user = user;
            ctx.session.userId = user.id;
            return ctx.redirect('dashboard');
        }else{
            return ctx.render('login', { error: 'invalid login' });
        }
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