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
var config = require('../config');
var platformConfig = require('../config/platform');
var resourceEnginer = require('./resources');
var girlSFetchEnginer = require('./girls');

var fetchResultData = {}

function checkRegister(req, res, next){
  var authkey = req.session.passport ? req.session.passport.user : null;

  if(!authkey) return next();
  User.findOne({authkey: authkey }, (err, doc) => {
    if(err) return  res.json('error');
    if(doc) {
      return res.json({
        status: true,
        user: doc,
        version: config.version,
      })
    }else {
      next()
    }
  })
}

// user metadata
router.use('/metadata', checkRegister, (req, res, next) => {
    res.json({
      status: false,
      user: false,
      version: config.version,
   })
})

// user favorite list online item
router.use('/online', (req, res, next) => {
  let favoriteList = JSON.parse(req.body.json);
  let results = [];


  _.each(fetchResultData, (platform, key) => {
    _.each(platform, (item, keys) => {
      _.each(favoriteList, (favorite, index) => {
       if(favorite.anchor == item.anchor && favorite.roomId == item.roomId) {
         results.push(favorite)
       }
     })
    })
  })
  setTimeout(() => {
    res.json(_.uniqBy(results, 'anchor'));
  }, 1000)
  
})

// invite auth
router.use('/invite/:code', (req, res, next) => {
  let inviteCode = req.params.code || null;
  if(inviteCode == `${config.inviteCode}`) {
    res.json({status: true})
  }else {
    res.json({status: false})
  }
})

// search (item.title && item.anchor)
router.get('/search/:keyword', (req, res, next) => {
  let keyword = req.params.keyword.toLowerCase() || null;
  let results = [], result = [] ;
  result = _.each(fetchResultData, (platform, key) => {
    result = _.filter( platform, (item, keys) => {
      return  JSON.stringify(item.title).toLowerCase().indexOf(keyword) > -1 || JSON.stringify(item.anchor).toLowerCase().indexOf(keyword) > -1;
    })
    results.push(result);
  })

  let datas = _.flatten(results, true)

  setTimeout(() => {
    res.json(_.uniqBy(datas, 'anchor'));
  }, 1000)

})

// recommend apis
router.get('/recommend', (req, res, next) => {
  let results = {};
  let data = _.cloneDeep(fetchResultData);

  _.each(data, (platform, key) => {
    if(key == 'all') return;
    results[key] = platform.splice(0, 8)
  })

  setTimeout(function(){
    res.json(results)
  }, 1000)
});

// category api
router.get('/categorys', (req, res, next) => {
  let data = _.cloneDeep(platformConfig.gameType);

  _.each(fetchResultData, (platform, key) => {
    platformConfig.gameType.forEach((el, index) => {
      if(key == el.name) {
        data[index].count = platform.length
      }
    })
  })
  
  res.json(data)
})

// categorys apis
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
  let params = [];

  platformConfig.gameType.map( category => params.push(category.name) )

  async.forever(next => {
    fn(() => setTimeout(() => {
      next(null)
    }, 60 * 1000))
  }, err => {
    console.log(err)
  })

  function fn(cb) {
    async.eachLimit(params, 1 , (name, callback) => {
        if(name == 'girls') {
          return girlSFetchEnginer(fetchResultData, callback)
        }
            
        return resourceEnginer(name, fetchResultData, callback)
    })
    return cb()
  }

}

module.exports = router;