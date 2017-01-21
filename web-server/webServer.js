import * as Koa from 'koa';
import * as convert from 'koa-convert';
import * as route from 'koa-route';
import * as render from 'koa-ejs';
import * as log4js from 'log4js';
import * as path from 'path';
import * as bodyParser from 'koa-bodyparser';
import * as userDao from './dao/userDao';
import * as sessionService from './service/sessionService';
import co from 'co';
import session from 'koa-session2';
import * as mount from 'koa-mount';
import * as compress from 'koa-compress';
import * as serve from 'koa-static';
import * as  CSRF from 'koa-csrf';

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

app.use(convert(compress({
    threshold: 2048,
    flush: require('zlib').Z_SYNC_FLUSH
})));

app.use(async function logging(ctx,next){
    const start = Date.now();
    await next();
    const end = Date.now();
    process.nextTick(()=>{
        var length = ctx.response.header['content-length'] || '-';
        logger.trace(ctx.req.method+'\t'+(end-start)+'ms\t'+length+'\t'+ ctx.req.url);
    });
});

app.use(serve(__dirname + '/../public'));

app.use(session({
    // secret:'asdf',
    // saveUninitialized:false,
    // resave:false,
    store: sessionService
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
    ctx.state.session = ctx.session;
    if(ctx.session.userId){
        ctx.state.user = await userDao.getOneById(ctx.session.userId);
    }else{
        ctx.state.user = undefined;
    }
    await next();
});

app.use(route.get('/', async function(ctx){
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
            console.log(err);
            ctx.body = err.message;
        }
    }
});



app.use(mount('/auth',require('./routes/authRouter')));
app.use(mount('/api/user', require('./routes/api/userAPIRouter')));


app.use(async function ensureAuthUser(ctx,next){
    if(ctx.session.user){
        await next();
    }else{
        throw new Error('permission denied '+ctx.req.url);
    }
});


app.listen(process.env.PORT || 3000);