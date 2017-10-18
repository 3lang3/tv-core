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
var Spider = require('./new');
var FetchImg = require('./img');
var girlSFetchEnginer = require('./girls');
var ScreenModal = require('../schema/Screen');
var CategoryModal = require('../schema/Category');
var TestModal = require('../schema/Test');

var fetchResultData = {}

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

// random category apis
router.get('/random', (req, res, next) => {
  let result = [];
  _.each(fetchResultData, (platform, key) => {
    if(key != 'all' || key != 'girls') {
      result.push(_.sample(platform, 1));
    }
  })

  return setTimeout(() => res.json(result), 500)
});

autoFetch();
function autoFetch() {
  let newPlatform = platformConfig.newPlatform;
  async.forever(next => {
    fn(() => setTimeout(() => {
      console.log('finished!')
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
    console.log('enter search')
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
    console.time();
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
      console.log('The filer database is done!')
      console.timeEnd()
      resolve(categoryArray)
    })
  })
}

const testFuc = () => {
  let data = [];

  for(var i = 0; i < 1000; i++ ) {
    data.push({
      updateOne: {
        filter: { count: i },
        update: {
          count: i,
        },
        upsert: true,
      }
    })
  }

  console.time('test time')
  TestModal.bulkWrite(data, (err, result) => {
     
    if(err) console.log('err', err)
    console.log(result)
    console.timeEnd('test time') 
  })
}
// testFuc();
// categoryFilter();
module.exports = router;