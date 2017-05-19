'use strict';

var express = require('express');
var router = express.Router();
var app = express();
var _ = require('lodash');
var superagent = require('superagent');
var async = require('async');
var cheerio = require('cheerio');
var passport = require('passport');
var dota2 = require("dota2");
var steam = require('steam');
var steamClient = new steam.SteamClient();
var Dota2 = new dota2.Dota2Client(steamClient, true);
var User = require('./../schema/User');
var crypto = require('crypto');

var resourceEnginer = require('./resources');
var girlSFetchEnginer = require('./girls');

const testInviteCode = 'testcode';

var fetchResultData = {
  dota2: {},
  lol: {},
  csgo: {},
  girls: {},
  tvgame: {},
  starcraft: {},
  hearthstone: {},
  all: {},
}

function checkRegister(req, res, next){
  var authkey = req.session.passport ? req.session.passport.user : null;

  // if(authkey && authkey.indexOf('steam') > -1 ) {
  //   authkey = Dota2.ToAccountID(authkey.split('steam')[1]);
  // }

  if(!authkey) return next();
  User.findOne({authkey: authkey }, (err, doc) => {
    console.log(doc, authkey)
    if(err) return  res.json('error');
    if(doc) {
      return res.json(doc);
    }else {
      next()
    }
  })
}

router.use('/metadata', checkRegister, (req, res, next) => {
  var accountId = req.session.passport ? Dota2.ToAccountID(req.session.passport.user) : null;
  if(accountId) {

    }else {
      res.json({status: false})
    }
})

router.use('/invite/:code', (req, res, next) => {
  let inviteCode = req.params.code || null;
  if(inviteCode == testInviteCode) {
    res.json({status: true})
  }else {
    res.json({status: false})
  }
})

/* GET home page. */
router.get('/categorys/:name', (req, res, next) => {
  let params = req.params.name || 'all';
  _.each(fetchResultData, (platform, key) => {
    if(params == key) {
      return setTimeout(() => res.json(platform), 500)
    }
  })
});

autoFetch();
function autoFetch() {
  let params = [
    'dota2',
    'lol',
    'csgo',
    'girls',
    'tvgame',
    'starcraft',
    'hearthstone',
    'all'
  ]

  async.forever(next => {
    fn(() => setTimeout(() => {
      next(null)
    }, 60 * 1000))
  }, err => {
    console.log(err)
  })

  function fn(cb) {
    async.eachLimit(params, 1 , (name, callback) => {
        _.each(fetchResultData, (platform, key) => {
          if(name == key && name) {
            if(name == 'girls') {
              return girlSFetchEnginer(fetchResultData, callback)
            }
            return resourceEnginer(name, fetchResultData, callback)
          }
        })
    })
    return cb()
  }

  
}

module.exports = router;