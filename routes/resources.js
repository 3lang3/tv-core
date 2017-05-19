'use strict';

var express = require('express');
var router = express.Router();
var app = express();
var _ = require('lodash');
var superagent = require('superagent');
var async = require('async');
var cheerio = require('cheerio');

var twitchKey = 'b126oamqxmzf2rbuh2smmoumpgscjf';
var platforms = [
  {name: 'douyu', href: 'http://www.douyu.com/directory/game/'},
	{name: 'huomao', href: 'http://www.huomao.com/channels/channel.json?page=1&page_size=120&game_url_rule='},
  {name: 'twitch', href: `https://api.twitch.tv/kraken/streams?limit=60&client_id=${twitchKey}&game=`},
];

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
		switch(platform.name) {
			case 'douyu':
				return datas.push(douyuParse(results[index], cb))

			case 'huomao':
				return datas.push(huomaoParse(results[index], cb))

			case 'twitch':
				return datas.push(twitchParse(results[index], cb))

			default:
				return [];
		}
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
    if(param == 'hearthstone') {
      return `${platform.href}How`
    }
    if(param == 'all') {
      return `http://www.douyu.com/directory/all`
    }
  }

  if(platform.name == 'huomao') {
    if(param == 'csgo') {
      return `${platform.href}CSGO`
    }
    if(param == 'hearthstone') {
      return `${platform.href}ls`
    }
    if(param == 'tvgame') {
      return `${platform.href}zhuji`
    }
  }

	return `${platform.href}${param}`;
}

function fetchPlatform(url, cb) {
  console.log('fetch: ', url)
  superagent
    .get(url)
    .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36')
    .timeout(5000)
    .end((err, data) => {
      if (err) {
        console.log(err, url)
        cb(null, null);
      } else {
        cb(null, data);
      }
    })
}

function douyuParse(datas, cb) {
  var $;
  try{
    $ = cheerio.load(datas.text);
  }catch(e){
    console.log(e, 'douyu err')
    return [];
  }

  var room, rooms = [];
  $('#live-list-contentbox li').each(function(index, el) {
    var _view = $(el).find('span.dy-num').text();
    if(_view.indexOf('万') > -1 ) _view = parseFloat(_view)*10000;
    if(_view < 800) return;
    var room = {
      roomId: $(el).data('rid'),
      type: $(el).find('span.tag').text(),
      title: $(el).find('h3').text().trim(),
      viewNumber: parseFloat(_view),
      view: $(el).find('span.dy-num').text(),
      platform: 'douyu',
      live: true,
      anchor: $(el).find('span.dy-name').text(),
      cover: $(el).find('img[data-original]').data('original'),
    }

    rooms.push(room)
  });

  return rooms;
}

function twitchParse(datas, cb) {
  var data;
  try{
    data = JSON.parse(datas.text);
  }catch(e){
    return [];
  }
  if(data.streams.length == 0) return [];
  var room, rooms = [];
  _.each(data.streams, (el, index) => {
  	var _view = el.viewers;
    if(_view < 100) return;
    var _live = el.stream_type == 'live' ? true : false;
  	if(!_live) return;
    room = {
      roomId: el.channel.name,
      type: el.game,
      title: el.channel.status,
      viewNumber: parseFloat(_view),
      view: _view,
      platform: 'twitch',
      live: _live,
      anchor: el.channel.display_name || el.channel.name,
      cover: el.preview.large || el.preview.medium,
    }
    rooms.push(room);
  })

  return rooms;
}

function huomaoParse(datas, cb) {
  var data;
  try{
    data = JSON.parse(datas.text);
  }catch(e){
    console.log('huomao err')
    return [];
  }

  if(!data.status) return [];
  if(!data.data.channelList.length) return [];
  var room, rooms = [];
  _.each(data.data.channelList, (el, index) => {
  	var _view = el.views;

    if(_view.indexOf('万') > -1 ) {
    	_view = parseFloat(_view)*10000
    }else {
    	_view = _view.replace(',', '')
    }
    if(_view < 800) return;
  	if(el.is_live == '0') return;
    room = {
      roomId: el.room_number,
      type: el.gameEname,
      title: el.channel,
      viewNumber: parseFloat(_view),
      view: el.views,
      platform: 'huomao',
      live: el.is_live,
      anchor: el.nickname || el.username,
      cover: el.image,
    }
    rooms.push(room);
  })

  return rooms;
}

function luozhuParse(data, cb) {
  var data = JSON.parse(data.text);
  if(!data.data.items.length) return false;
  var room, rooms = [];
  _.each(data.data.items, (el, index) => {
    room = {
      roomId: el.channel.id,
      type: el.game.name || el.game.tag,
      title: el.channel.status,
      view: el.viewers,
      platform: 'longzhu',
      live: true,
      anchor: el.channel.name,
      cover: el.channel.avatar,
    }
    rooms.push(room);
  })
  return rooms;
}

module.exports = fetchEnginer;