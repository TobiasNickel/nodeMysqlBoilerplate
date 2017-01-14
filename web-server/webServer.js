var Koa = require('koa');
var convert = require('koa-convert');
var route = require('koa-route');
var render = require('koa-ejs');
var log4js = require('log4js');
var path = require('path');
var bodyParser = require('koa-bodyparser');
import co from 'co';
import session from "koa-session2";
var mount = require('koa-mount');
var compress = require('koa-compress');
const serve = require('koa-better-serve');
//var cookieParser = require('cookie-parser');
//var csrf = require('csurf');
var CSRF = require('koa-csrf');
//var csrfProtection = csrf({ cookie: true });
//var MySQLStore = require('express-mysql-session')(session);
var db = require('./utils/mysqlDB');

log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'dateFile',pattern:'-dd', filename: './logs/log.log'}
  ]
});
var logger = log4js.getLogger('{server}{webServer.js}');

var app = new Koa();

render(app, {
     root: path.join(__dirname, '/views'),
     viewExt:'ejs',
     debug:true
    //todo: path
});
app.context.render = co.wrap(app.context.render);

app.use(co.wrap(compress({})));

app.use(async function logging(ctx,next){
    const start = Date.now();
    await next();
    const end = Date.now();
    process.nextTick(()=>{
        var length = ctx.response.header['content-length'] || '-';
        logger.trace(ctx.req.method+'\t'+(end-start)+'ms\t'+length+'\t'+ ctx.req.url);
    });
});

app.use(session({
    // secret:'asdf',
    // saveUninitialized:false,
    // resave:false,
    // store:new MySQLStore({},db.pool)
}));

app.use(convert(bodyParser()));


app.use(convert(new CSRF.default({
    invalidSessionSecretMessage: 'Invalid session secret ff',
    invalidSessionSecretStatusCode: 403,
    invalidTokenMessage: 'Invalid CSRF token',
    invalidTokenStatusCode: 403,
    excludedMethods: [ 'GET', 'HEAD', 'OPTIONS' ],
    disableQuery: false
})));
app.use(route.get('/csrftoken', async function(ctx){
    ctx.body = ctx.csrf; 
}));

app.use(async function(ctx, next){
    ctx.state.req = ctx.req;
    ctx.state.res = ctx.res;
    ctx.state.csrfToken = ctx.csrf;
    await next();
});

app.use(route.get('/', async function(ctx){
    console.log('route /');
    await ctx.render('index');
}));


// error handler
app.use(async function (ctx, next) {
    try{
        await next();
    }catch(err){
        if (err.code === 'EBADCSRFTOKEN') {
            ctx.status = 403;
            ctx.body = ('form not transmitted correctly, you are save now :-)');
        }else{
            ctx.body = err.message;
        }
    }
});



app.use(mount('/auth',require('./routes/authRouter')));

app.use(async function ensureAuthUser(ctx,next){
    if(ctx.session.user){
        return next();
    }else{
        throw new Error('permission denied'+ctx.req.url);
    }
});

app.use(serve(__dirname + '/../public'));

app.listen(process.env.PORT || 3000);