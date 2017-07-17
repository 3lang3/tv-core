'use strict';

var _ = require('lodash');
var request = require('request');
var async = require('async');
var cheerio = require('cheerio');
var platformConfig = require('../config/platform');
var parses = require('./parses');

var platforms = platformConfig.platforms;

function fetchEnginer(param, obj, callback) {

	var tasks = _.map(platforms, platform => {
		var _url = preFixUrl(platform, param);
		return (cb) => fetchPlatform(_url,  cb);
	})

	async.parallel(tasks, (err, results) => {
		var cb = null;
		var datas = _.flatten(switchParse(results, param, cb), true);

    if(datas.length == 0) return callback(null, null);

    datas.forEach((el, index) => {
      el.id = `${el.platform}${el.roomId}`;
    })

		var result = _.reverse(_.sortBy(datas, 'viewNumber'))

    obj[param] = result
    return callback(null, result);
	})
}

function switchParse(results, param, cb) {
	var datas = [];

	_.map(platforms, (platform, index) => {

      return datas.push(eval(`parses.${platform.name}Parse(results[index], param, cb)`));

  })

	return datas;
}

function preFixUrl(platform, param) {
	if(platform.name == 'twitch') {
		if(param == 'dota2') {
      return `${platform.href}Dota+2`
    }
    if(param == 'fight') {
      return `${platform.href}Street%20Fighter%20V`
    }
    if(param == 'outdoor') {
      return `${platform.href}IRL`
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
    if(param == 'wow') {
      return `${platform.href}World%20of%20Warcraft`
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
    if(param == 'outdoor') {
      return `${platform.href}HW`
    }
    if(param == 'fight') {
      return `${platform.href}FTG`
    }
    if(param == 'wow') {
      return `${platform.href}WOW`
    }
    if(param == 'hearthstone') {
      return `${platform.href}How`
    }
    if(param == 'hok') {
      return `${platform.href}wzry`
    }
    if(param == 'moive') {
      return `${platform.href}stdp`
    }
    if(param == 'all') {
      return `http://www.douyu.com/directory/all`
    }
  }

  if(platform.name == 'panda') {
    if(param == 'outdoor') {
      return `${platform.href}hwzb`
    }
    if(param == 'hok') {
      return `${platform.href}kingglory`
    }
    if(param == 'fight') {
      return `${platform.href}ftg`
    }
    if(param == 'tvgame') {
      return `${platform.href}pubg`
    }

    if(param == 'moive') {
      return `${platform.href}cartoon`
    }
    if(param == 'all') {
      return `https://www.panda.tv/live_lists?status=2&order=person_num&pageno=1&pagenum=120`
    }
  }

  if(platform.name == 'quanmin') {
    if(param == 'starcraft') {
      return ``
    }
    if(param == 'hok') {
      return `${platform.href}wangzhe`
    }
    if(param == 'outdoor') {
      return `${platform.href}huwai`
    }
    if(param == 'moive') {
      return `${platform.href}dzh`
    }
  }

  if(platform.name == 'huomao') {
    if(param == 'csgo') {
      return `${platform.href}CSGO`
    }
    if(param == 'outdoor') {
      return `${platform.href}Outdoor`
    }
    if(param == 'fight') {
      return `${platform.href}FTG`
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
    if(param == 'wow') {
      return `${platform.href}WOW`
    }
    if(param == 'kof') {
      return `${platform.href}all&labelid=93`
    }
    if(param == 'moive') {
      return `${platform.href}Movies`
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
    if(param == 'hok') {
      return `${platform.href}115/100/1.json`
    }
    if(param == 'wow') {
      return `${platform.href}8/100/1.json`
    }
  }
  
  if(platform.name == 'huya') {
    if(param == 'dota2') {
      return `${platform.href}7`
    }
    if(param == 'outdoor') {
      return `${platform.href}2836`
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
    if(param == 'hok') {
      return `${platform.href}2336`
    }
    if(param == 'wow') {
      return `${platform.href}8`
    }
    if(param == 'moive') {
      return `${platform.href}2135`
    }
    if(param == 'fight') {
      return ``
    }
    if(param == 'all') {
      return `${platform.href}0`
    }
  }

  if(platform.name == 'longzhu') {
    if(param == 'dota2') {
      return `${platform.href}30`
    }
    if(param == 'outdoor') {
      return `${platform.href}127`
    }
    if(param == 'lol') {
      return `${platform.href}4`
    }
    if(param == 'csgo') {
      return `${platform.href}187`
    }
    if(param == 'tvgame') {
      return `${platform.href}92`
    }
    if(param == 'hearthstone') {
      return `${platform.href}29`
    }
    if(param == 'overwatch') {
      return `${platform.href}113`
    }
    if(param == 'starcraft') {
      return `${platform.href}6`
    }
    if(param == 'hok') {
      return `${platform.href}103`
    }
    if(param == 'wow') {
      return `${platform.href}55`
    }
    if(param == 'moive') {
      return `${platform.href}112`
    }
    if(param == 'fight') {
      return ``
    }
    if(param == 'all') {
      return `${platform.href}0`
    }
  }

  if(platform.name == 'bilibili') {
    if(param == 'tvgame') {
      return `${platform.href}single`
    }
    if(param == 'all') {
      return `${platform.href}all`
    }
    return ``;
  }

	return `${platform.href}${param}`;
}

function fetchPlatform(url, cb) {
  if(url == '') return cb(null, null);

  var options = {
    url: url,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36'
    }
  };
  request(options, (err, res, body) => {
    if (err) {
      //console.log(err, url)
      cb(null, null);
    } else {
      cb(null, res);
    }
  })
}

module.exports = fetchEnginer;