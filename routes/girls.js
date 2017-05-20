'use strict';

var _ = require('lodash');
var superagent = require('superagent');
var async = require('async');
var cheerio = require('cheerio');

var viewLimit = 1000;
var platforms = [
	{name: 'douyu', href: 'http://www.douyu.com/directory/game/yz'},
  {name: 'douyuvideo', href: 'https://v.douyu.com/video/video/listData?page=1&cate1Id=3&cate2Id=18&action=num'},
  {name: 'douyuvideo', href: 'https://v.douyu.com/video/video/listData?page=1&cate1Id=3&cate2Id=25&action=num'},
  {name: 'douyuvideo', href: 'https://v.douyu.com/video/video/listData?page=1&cate1Id=3&cate2Id=24&action=num'},
	{name: 'huomao', href: 'http://www.huomao.com/channels/channel.json?page=1&page_size=120&game_url_rule=ylxx'},
	{name: 'afreecatv', href: `http://sch.afreecatv.com/api.php?nCateNo=00080000&m=vodSearch&v=1.0&szOrder=view_cnt&szFileType=ALL&szTerm=1week&nListCnt=40&c=UTF-8&w=webk&l=def&bAdultFlag=Y`},
];

function girlSFetchEnginer(obj, callback) {
	var tasks = _.map(platforms, platform => {
		return (cb) => fetchPlatform(platform.href, cb);
	})

	async.parallel(tasks, (err, results) => {
		var cb = null;
		var datas = _.flatten(switchParse(results, cb), true);
    if(datas.length == 0) return callback(null, null)
		var result = _.reverse(_.sortBy(datas, 'viewNumber'))
		
		obj['girls'] = result;
    return callback(null, null)
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

			case 'douyuvideo':
				return datas.push(douyuvideoParse(results[index], cb))

      case 'afreecatv':
        return datas.push(afreecatvParse(results[index], cb))

			default:
				return [];
		}
	})

	return datas;
}

function fetchPlatform(url, cb) {
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
    if(index > 19) return;

    var _view = $(el).find('span.dy-num').text();
    if(_view.indexOf('万') > -1 ) _view = parseFloat(_view)*10000;
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

function douyuvideoParse(datas, cb) {
  var data;
  try{
    data = JSON.parse(datas.text);
  }catch(e){
    return []; 
  }

  if(data.error != 0) return [];
  var room, rooms = [];
  _.each(data.data.list, (el, index) => {
  	var _view = el.view_num;
    var _ids = el.url.split('/');
    var _id = _ids[_ids.length - 1];
    if(_view.indexOf('万') > -1 ) _view = parseFloat(_view)*10000;

    room = {
      roomId: _id,
      type: 'girls',
      title: el.title,
      viewNumber: parseFloat(_view),
      view: el.view_num,
      platform: 'douyuvideo',
      live: true,
      anchor: el.author,
      cover: el.video_pic,
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
    if(index > 19) return;
  	var _view = el.views;
    if(_view.indexOf('万') > -1 ) {
    	_view = parseFloat(_view)*10000
    }else {
    	_view = _view.replace(',', '')
    }

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

function afreecatvParse(datas, cb) {
  var data;
  try{
    data = JSON.parse(datas.text);
  }catch(e){
    return [];
  }

  var room, rooms = [];
  if(data.TOTAL_CNT == 0) return [];
  var room, rooms = [];
  _.each(data.DATA, (el, index) => {
    if(index > 9) return;
    var _view = el.view_cnt;
    var _live = true ;
    room = {
      roomId: {
        nTitleNo: el.title_no,
        nStationNo: el.station_no,
        szCategory: el.category,
        nBbsNo: el.bbs_no,
        szBjId: el.user_id,
      },
      type: 'girls',
      title: el.b_title,
      viewNumber: parseFloat(_view),
      view: _view,
      platform: 'afreecatv',
      live: _live,
      anchor: el.user_nick,
      cover: el.thumbnail_path,
    }
    rooms.push(room);
  })

  return rooms;
}

module.exports = girlSFetchEnginer;