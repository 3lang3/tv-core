'use strict';

var _ = require('lodash');
var superagent = require('superagent');
var async = require('async');
var cheerio = require('cheerio');
var platformConfig = require('../config/platform');
var parses = require('./parses');

var platforms = platformConfig.platforms;

function fetchEnginer(param, obj, callback) {

	var tasks = _.map(platforms, platform => {
		var _url = preFixUrl(platform, param);
		return (cb) => fetchPlatform(_url, cb);
	})

	async.parallel(tasks, (err, results) => {
		var cb = null;
		var datas = _.flatten(switchParse(results, cb), true);
    if(datas.length == 0) return callback(null, null)
		var result = _.reverse(_.sortBy(datas, 'viewNumber'))

    obj[param] = result
    return callback(null, result);
	})
}

function switchParse(results, cb) {
	var datas = [];

	_.map(platforms, (platform, index) => {

      return datas.push(eval(`parses.${platform.name}Parse(results[index], cb)`));

  })

	return datas;
}

function preFixUrl(platform, param) {
	if(platform.name == 'twitch') {
		if(param == 'dota2') {
      return `${platform.href}Dota+2`
    }
    if(param == 'csgo') {
      return `${platform.href}Counter-Strike%3A%20Global%20Offensive`
    }
    if(param == 'lol') {
      return `${platform.href}League+of+Legends`
    }
    if(param == 'overwatch') {
      return `${platform.href}Overwatch`
    }
    if(param == 'hearthstone') {
      return `${platform.href}Hearthstone`
    }
    if(param == 'starcraft') {
      return `${platform.href}StarCraft II`
    }
    if(param == 'tvgame') {
      return `${platform.href}PLAYERUNKNOWN'S%20BATTLEGROUNDS`
    }
    if(param == 'all') {
      return `${platform.href}`
    }
	}

  if(platform.name == 'douyu') {
    if(param == 'starcraft') {
      return `${platform.href}sc`
    }
    if(param == 'hearthstone') {
      return `${platform.href}How`
    }
    if(param == 'all') {
      return `http://www.douyu.com/directory/all`
    }
  }

  if(platform.name == 'quanmin') {
    if(param == 'starcraft') {
      return ``
    }
  }

  if(platform.name == 'huomao') {
    if(param == 'csgo') {
      return `${platform.href}CSGO`
    }
    if(param == 'overwatch') {
      return `${platform.href}Overwatch`
    }
    if(param == 'hearthstone') {
      return `${platform.href}ls`
    }
    if(param == 'tvgame') {
      return `${platform.href}zhuji`
    }
  }

  if(platform.name == 'zhanqi') {
    if(param == 'lol') {
      return `${platform.href}6/100/1.json`
    }
    if(param == 'csgo') {
      return `${platform.href}119/100/1.json`
    }
    if(param == 'dota2') {
      return `${platform.href}10/100/1.json`
    }
    if(param == 'overwatch') {
      return `${platform.href}82/100/1.json`
    }
    if(param == 'hearthstone') {
      return `${platform.href}9/100/1.json`
    }
    if(param == 'starcraft') {
      return `${platform.href}5/100/1.json`
    }
    if(param == 'tvgame') {
      return `${platform.href}49/100/1.json`
    }
  }

  if(platform.name == 'huya') {
    if(param == 'dota2') {
      return `${platform.href}7`
    }
    if(param == 'csgo') {
      return `${platform.href}862`
    }
    if(param == 'tvgame') {
      return `${platform.href}1964`
    }
    if(param == 'hearthstone') {
      return `${platform.href}393`
    }
    if(param == 'overwatch') {
      return `${platform.href}2174`
    }
    if(param == 'lol') {
      return `${platform.href}1`
    }
    if(param == 'starcraft') {
      return `${platform.href}5`
    }
    if(param == 'all') {
      return `${platform.href}0`
    }
  }

  if(platform.name == 'bilibili') {
    if(param == 'tvgame') {
      return `${platform.href}single`
    }else if(param == 'all') {
      return `${platform.href}all`
    }else {
      return ``;
    }
  }

	return `${platform.href}${param}`;
}

function fetchPlatform(url, cb) {
  if(url == '') return cb(null, null);
  superagent
    .get(url)
    .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36')
    .timeout(5000)
    .end((err, data) => {
      if (err) {
        //console.log(err, url)
        cb(null, null);
      } else {
        cb(null, data);
      }
    })
}

module.exports = fetchEnginer;