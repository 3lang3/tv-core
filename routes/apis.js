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
var Spider = require('./new');
var FetchImg = require('./img');
var ScreenModal = require('../schema/Screen');
var CategoryModal = require('../schema/Category');


function checkRegister(req, res, next){
  var authkey = req.session.passport ? req.session.passport.user : null;
  console.log('meta err enter: ', authkey)
  if(!authkey) return next();
  User.findOne({authkey: authkey }, (err, doc) => {
    console.log('meta err: ', err)
    if(err) return  res.json('error');
    if(doc) {
      console.log('meta doc: ')
      return res.json({
        status: true,
        user: doc,
        version: config.version,
      })
    }else {
      console.log('meta next: ')
      next()
    }
  })
}

// user metadata
router.use('/metadata', checkRegister, (req, res, next) => {
    console.log('meta enter: ')
    res.json({
      status: false,
      user: false,
      version: config.version,
   })
})

// user favorite list online item
router.use('/online', async (req, res, next) => {
  let favoriteList = JSON.parse(req.body.json);
  let results = [];

  for(let el of favoriteList) {
    let t = await ScreenModal.findOne({anchor: el.anchor, roomId: el.roomId})
    t && results.push(t)
  }

  res.json(_.uniqBy(results, 'anchor'));
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


// screen apis
router.get('/screen/:rooms', async (req, res, next) => {
  let rooms;

  try {
    rooms = req.params.rooms.split('--');
  }catch(e) {
    console.log(e)
  }

  let empytAry = [], _room, _id, _platform, results = [];

  for(let index in rooms) {
    if(!rooms[index]) continue;
    _room = rooms[index].split('_');
    _platform = _room[0];
    _id = _room[1].indexOf('{') > -1 ? JSON.parse(_room[1]) : _room[1];

    let a = await ScreenModal.findOne({platform: _platform, roomId: _id})

    results.push(a);
  }

  console.log(results)

  res.json(results)

});

// random category apis
router.get('/random', async (req, res, next) => {

  let lists = await ScreenModal.find({live: true});
  let result = _.sampleSize(lists, 10)

  res.json(result)
});

autoFetch();
function autoFetch() {
  let newPlatform = platformConfig.newPlatform;
  async.forever(next => {
    fn(() => setTimeout(() => {
      next(null)
    }, 5 * 60 * 1000))
  }, err => {
    console.log(err)
  })

  function fn(cb) {
    async.eachLimit(newPlatform, 1, (platform, callback) => {
      var _newspider = new Spider(platform);
      _newspider.init(callback)
    }, (err) => {
      console.log(err || 'All platform done!')
      categoryFilter();
    })
    return cb()
  }
}


// test apis
router.get('/search', async (req, res, next) => {

  let pageLimit = 40;
  let {type, word, page, platform} = req.query;
  let query, findObj = {};

  if(type == 'getCategory') {
    query = await CategoryModal.findOne({name: 'All type', }).sort({tv: -1 });
    let platforms = await CategoryModal.findOne({name: 'Platform type'});
    return res.json({list: query, platforms: platforms})
  }

  if(type == 'keyword') {
    var reg = new RegExp(word, 'i');
    query = await ScreenModal.find({$or : [{title :  reg},{anchor : reg}]}).sort({viewNumber: -1 }).limit(10)
  }

  if(type == 'category') {
    query = await ScreenModal.find({type: word, live: true}).sort({viewNumber: -1 }).skip(pageLimit * page).limit(pageLimit);
  }

  if(type == 'platform') {
    query = await ScreenModal.find({platform: word, live: true}).sort({viewNumber: -1 }).skip(pageLimit * page).limit(pageLimit);
  }

  if(type == 'all') {
    platform && platform !='all' ? findObj.platform = platform : '';
    word && word !='all' ? findObj.type = word : '';
    findObj.live = true;
    query = await ScreenModal.find(findObj).sort({viewNumber: -1 }).skip(pageLimit * page).limit(pageLimit);
  }

  res.json(query);

});

// get img
router.get('/getImg', async (req, res, next) => {

  for(let platform of platformConfig.newPlatform) {
    if(platform.imgUrl) {
      await FetchImg(platform.imgUrl, platform.platform);
    }
  }
  res.json({status: true, message: 'done!'})
}) 


let categoryFilter = () => {
  return new Promise(async (resolve, reject) => {
    console.time('get category time');
    let typeQuery = await ScreenModal.distinct('type');
    let platformQuery = await ScreenModal.distinct('platform');
    let allLiveList = await ScreenModal.find({live: true});
    let screenResult = {};
    let categoryArray = [];

    
    for(let i of typeQuery) {
      screenResult[i] = [];

      allLiveList.forEach(list => {
        if(list.type == i) {
          screenResult[i].push(list)
        }
      })
    }

    for(let type in screenResult) {

      let view = 0;

      screenResult[type].forEach(doc => {
        view += doc.viewNumber*1;
      })

      categoryArray.push({
        type: type,
        view: view,
        tv: screenResult[type].length,
      })
    }

    categoryArray.sort((a, b) => b.tv - a.tv );
    
    CategoryModal.bulkWrite([
      {
        updateOne: {
          filter: {name: 'All type'},
          update: {
            name: 'All type',
            description: '所有直播类型',
            result: categoryArray
          },
          upsert: true,
        },
      },  
      {
        updateOne: {
          filter: {name: 'Platform type'},
          update: {
            name: 'Platform type',
            description: '所有平台',
            result: platformQuery
          },
          upsert: true,
        }
      }
    ]).then(() => {
      console.timeEnd('get category time')
      resolve(categoryArray)
    })
  })
}

// categoryFilter();
module.exports = router;