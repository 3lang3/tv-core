var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compression = require('compression');
var session = require('cookie-session');
var passport = require('passport');
var cors = require('cors');
var mongoose = require('mongoose');
var config = require('./config')

mongoose.connect('mongodb://localhost/tv');

var routes = require('./routes/index');
var users = require('./routes/users');
var apis = require('./routes/apis');
var login = require('./routes/web');
var chat = require('./routes/chat');

var async = require('async');
var User = require('./schema/User');
var crypto = require('crypto');
var dota2 = require("dota2");
var steam = require('steam');
var superagent = require('superagent');
var steamClient = new steam.SteamClient();
var Dota2 = new dota2.Dota2Client(steamClient, true);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
const sessOptions = {
  domain: `${config.Host}`,
  maxAge: 52 * 7 * 24 * 60 * 60 * 1000,
  secret: 'testsecretvalue',
};

var LocalStrategy = require('passport-local');
var SteamStrategy = require('passport-steam');
const apiKey = 'E0D3B44CFEA428B96F97616D00874255';
const host = `${config.endHost}`;

passport.serializeUser((user, done) => {
  done(null, user.authkey);
});
passport.deserializeUser((steamid, done) => {
  done(null, {
    steamid: steamid
  });
});

function fetchOpenDota(accountId, cb) {
  superagent
      .get(`https://api.opendota.com/api/players/${accountId}`)
      .end((err, result) => {
        var data = JSON.parse(result.text);
        cb(null, data)
      })
}

passport.use(new SteamStrategy({
  returnURL: `${host}returnSteam`,
  realm: host,
  apiKey: apiKey,
  passReqToCallback: true,
}, (req, identifier, profile, done) => {

  const sessionUser = req.session.passport ? req.session.passport.user : null;
  const accountId = Dota2.ToAccountID(profile.id);

  var has_bind_user = null;
  var bind_user = null;
  var sessionUserData = null;

  async.waterfall([
      (cb) => {
        if(sessionUser) {
          User.findOne({email: sessionUser}, (err, doc) => {
            sessionUserData = doc;
            cb(null, null)
          })
        }else {
          cb(null, null)
        }
      },
      (data, cb) => {
        console.log(2)
        User.findOne({steamId: profile.id}, (err, doc) => {
          if(doc) {
            has_bind_user = true;
            bind_user = doc;
          }
          cb(null, null)
        })
      },
      (data, cb) => {
        if(has_bind_user == true && !sessionUser) {
          return cb(null, bind_user)
        }
        if(has_bind_user == true) return cb(null, false);
        fetchOpenDota(accountId, cb)
      },
      (data, cb) => {
        if(has_bind_user == true && !sessionUser) {
          return cb(null, bind_user)
        }
        if(has_bind_user == true) return cb(null, false);
        if(sessionUserData) {
          User.update({email: sessionUser}, {
            $set: {
              avatar: data.profile.avatarfull,
              steamInfo: data,
              steamId: profile.id,
            }
          }, err => {
            User.findOne({email: sessionUser}, (err, user) => cb(null, user))
          })
        }else {
          var _user = {
              nickname: data.profile.personaname,
              authkey: `steam${profile.id}`,
              avatar: data.profile.avatarfull,
              steamId: profile.id,
              steamInfo: data,
            }

            var newUser = new User(_user)
            newUser.save(err => {
              return cb(null, _user)
            });
        }
      }
    ], (err, result) => {
      console.log(5, result)
      return done(null, result)
    })
}));

passport.use(new LocalStrategy({
  usernameField: 'email',
  session: false,
  passReqToCallback: true,
},(req, email, password, done) => {

  var email = req.query.email,
      nickname = req.query.nickname,
      md5 = crypto.createHash('md5'),
      password = md5.update(req.query.password).digest('base64');
    
  // rigister
  console.log(nickname)
  if(nickname) {
    console.log('registeiung')
     User.findOne({ email: email }, function (err, user) {
      if (err) { 
        return done(err); 
      }
      //
      if (!user) {
        var obj = {
          email: email,
          nickname: nickname,
          password: password,
          authkey: email,
        }

        var newUser = new User(obj)

        newUser.save(err => {
          return done(null, obj);
        });
      }else {
        return done(null, false);
      }
    });
  }else {
    console.log('login')
    // login
    User.findOne({ email: email, password: password }, function (err, user) {
      if (err) { 
        console.log('login err', err)
        return done(err); 
      }
      //
      if (!user) {
        console.log('not right password')
        return done(null, false);
      }else {
        return done(null, user);
      }
      //if (!user.verifyPassword(password)) { return done(null, false); }
      //return done(null, user);
    });
  }

}));

// CORS headers
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(compression());
app.use(session(sessOptions));
app.use(passport.initialize());
app.use(passport.session());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes, login);
app.use('/users', users);
app.use('/chat', chat);
app.use('/api', apis);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
