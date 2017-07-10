var express = require('express');
var path = require('path');
var app = express();
var config = require('../config');
var session = require('cookie-session');

var passport = require('passport');
var async = require('async');
var User = require('../schema/User');
var crypto = require('crypto');
var dota2 = require("dota2");
var steam = require('steam');
var superagent = require('superagent');
var steamClient = new steam.SteamClient();
var Dota2 = new dota2.Dota2Client(steamClient, true);

var LocalStrategy = require('passport-local');
var SteamStrategy = require('passport-steam');
const apiKey = `${config.steamKey}`;
const host = `${config.endHost}`;

// session setting
const sessOptions = {
  domain: `${config.Host}`,
  maxAge: `${config.sessionMaxAge}`,
  secret: `${config.sessionSecret}`,
};

// app use
app.use(session(sessOptions));
app.use(passport.initialize());
app.use(passport.session());

// passport serialize & deserialize
passport.serializeUser((user, done) => {
  done(null, user.authkey);
});

passport.deserializeUser((steamid, done) => {
  done(null, {
    steamid: steamid
  });
});

// fetch dota2 info -by opendota api
function fetchOpenDota(accountId, cb) {
  superagent
      .get(`${config.openDotaApiHost}players/${accountId}`)
      .end((err, result) => {
        var data = JSON.parse(result.text);
        cb(null, data)
      })
}

// steam oauth 
passport.use(new SteamStrategy({
  returnURL: `${config.endHost}returnSteam`,
  realm: `${config.endHost}`,
  apiKey: `${config.steamKey}`,
  passReqToCallback: true,
}, (req, identifier, profile, done) => {
  console.log('enter')

  const sessionUser = req.session.passport ? req.session.passport.user : null;
  const accountId = Dota2.ToAccountID(profile.id);

  var has_bind_user = null;
  var bind_user = null;
  var sessionUserData = null;

  async.waterfall([
      (cb) => {
        // if registed
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

        // if has been bound
        User.findOne({steamId: profile.id}, (err, doc) => {
          if(doc) {
            has_bind_user = true;
            bind_user = doc;
          }
          cb(null, null)
        })
      },
      (data, cb) => {
        // if has been bound return user
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

            var newUser = new User(_user);

            newUser.save(err => {
              return cb(null, _user)
            });
        }
      }
    ], (err, result) => {

      return done(null, result)
    })
}));

// local auth
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
  if(nickname) {

     User.findOne({ email: email }, function (err, user) {
      if (err) { 
        return done(err); 
      }
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
    // login
    User.findOne({ email: email, password: password }, function (err, user) {
      if (err) { 
        console.log('login err', err)
        return done(err); 
      }


      if (!user) {
        console.log('not right password')
        return done(null, false);
      }else {
        return done(null, user);
      }

    });
  }
}));

module.exports = app;