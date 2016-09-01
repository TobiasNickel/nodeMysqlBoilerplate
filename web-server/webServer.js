var express = require('express');
var log4js = require('log4js');
var bodyParser = require('body-parser');
var session = require('express-session');
var compression = require('compression');
var cookieParser = require('cookie-parser')
var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });
var MySQLStore = require('express-mysql-session')(session);
var db = require('./utils/mysqlDB');

log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'dateFile',pattern:'-dd', filename: './logs/log.log'}
  ]
});
var logger = log4js.getLogger('{server}{server.js}');

var app = express();

app.set('view engine', 'ejs');
app.set('views', process.cwd()+'/web-server/views');

app.use(compression());
app.use(log4js.connectLogger(logger, { 
    level: log4js.levels.INFO, 
    format: ':method\t:res[Content-Length]\t:response-time\t:remote-addr\t:url \t:referrer' // http://www.senchalabs.org/connect/logger.html
}));

app.use(express.static(__dirname + '/../public'));
app.use(bodyParser.urlencoded({ extended:true }));
app.use(cookieParser())
app.use(csrfProtection);

// error handler
app.use(function (err, req, res, next) {
  if (err.code !== 'EBADCSRFTOKEN') return next(err)

  // handle CSRF token errors here
  res.status(403)
  res.send('form not transmitted correctly, you are save now :-)')
});

app.get('/csrftoken',function(req,res){
    res.json(req.csrfToken()); 
});

app.use(session({
    secret:'asdf',
    saveUninitialized:false,
    resave:false,
    store:new MySQLStore({},db.pool)
}));


app.use(function(req,res,next){
    res.locals.req = req;
    res.locals = res.locals;
    res.locals.csrfToken = req.csrfToken()
    next();
});

app.get('/',function(req,res){
    res.render('index.ejs')
});

app.use('/auth',require('./routes/authRouter'));
app.use(function ensureAuthUser(req,res,next){
    if(req.session.user){
        next();
    }else{
        next(new Error('permission denied'));
    }
})

app.use(function(req,res){
    res.json('404')
});

app.listen(process.env.PORT || 3000);