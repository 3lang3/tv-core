var cheerio = require('cheerio');
var _ = require('lodash');


function douyuParse(datas, param, cb) {
  var $;

  try{
    $ = cheerio.load(datas.body);
  }catch(e){
    return [];
  }

  var room, rooms = [];
  $('#live-list-contentbox li').each(function(index, el) {
    var _view = $(el).find('span.dy-num').text();
    if(_view.indexOf('万') > -1 ) _view = parseFloat(_view)*10000;
    if(_view < 600) return;
    var room = {
      roomId: $(el).data('rid'),
      type: param,
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

function douyuvideoParse(datas, param, cb) {
  var data;
  try{
    data = JSON.parse(datas.body);
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
      type: param,
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

function twitchParse(datas, param, cb) {
  var data;
  try{
    data = JSON.parse(datas.body);
  }catch(e){
    return [];
  }
  if(!data.streams) return [];
  var room, rooms = [];
  _.each(data.streams, (el, index) => {
  	var _view = el.viewers;
    if(_view < 50) return;
    var _live = el.stream_type == 'live' ? true : false;
  	if(!_live) return;
    room = {
      roomId: el.channel.name,
      type: param,
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

function huomaoParse(datas, param, cb) {
  var data;
  try{
    data = JSON.parse(datas.body);
  }catch(e){
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
    if(_view < 600) return;
  	if(el.is_live == '0') return;
    room = {
      roomId: el.room_number,
      type: param,
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

function longzhuParse(datas, param, cb) {
  var data;
  //console.log(datas.text)
  try{
    data = JSON.parse(datas.body);
  }catch(e){
    return [];
  }
  if(!data.data.items.length) return [];
  var room, rooms = [];
  _.each(data.data.items, (el, index) => {
    room = {
      roomId: el.channel.id,
      type: param,
      title: el.channel.status,
      viewNumber: parseFloat(el.viewers),
      view: el.viewers,
      platform: 'longzhu',
      live: true,
      anchor: el.channel.name,
      cover: el.preview,
    }
    rooms.push(room);
  })
  return rooms;
}

function huyaParse(datas, param, cb) {
  var data;
  try{
    data = JSON.parse(datas.body);
  }catch(e){
    return [];
  }
  if(data.status !== 200) return [];
  var room, rooms = [];
  _.each(data.data.datas, (el, index) => {
    var _view = parseFloat(el.totalCount);
    if(_view < 100) return;
    var _live = true;

    room = {
      roomId: el.privateHost,
      type: param,
      title: el.roomName,
      viewNumber: _view,
      view: _view,
      platform: 'huya',
      live: _live,
      anchor: el.nick,
      cover: el.screenshot,
    }
    rooms.push(room);
  })

  return rooms;
}

function bilibiliParse(datas, param, cb) {
  var data;
  try{
    data = JSON.parse(datas.body);
  }catch(e){
    return [];
  }
  if(data.data.length == 0 ) return [];
  var room, rooms = [];
  _.each(data.data, (el, index) => {
    var _view = el.online;
    //if(_view < 100) return;
    var _live = true;

    room = {
      roomId: el.roomid,
      type: param,
      title: el.title,
      viewNumber: parseFloat(_view),
      view: _view,
      platform: 'bilibili',
      live: _live,
      anchor: el.uname,
      cover: el.cover,
    }
    rooms.push(room);
  })

  return rooms;
}

function afreecatvParse(datas, param, cb) {
  var data;
  
  try{
    data = JSON.parse(datas.body);
  }catch(e){
    return [];
  }

  var room, rooms = [];
  if(data.TOTAL_CNT == 0) return [];
  var room, rooms = [];
  _.each(data.DATA, (el, index) => {
    if(index > 19) return;
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
      type: param,
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

function quanminParse(datas, param, cb) {
  var $;

  try{
    $ = cheerio.load(datas.body);
  }catch(e){
    return [];
  }

  var room, rooms = [];
  if($('.list_w-videos').length > 1) {
    var $par = $('.list_w-videos').eq(1).find('li');
  }else {
    var $par = $('.list_w-videos li');
  }

  $par.each(function(index, el) {
    var _view = $(el).find('span.common_w-card_views-num').text().trim();
    if(_view.indexOf('万') > -1 ) _view = parseFloat(_view)*10000;
    if(_view < 500) return;
    var room = {
      roomId: $(el).find('.common_w-card_href').attr('href').split('.tv/')[1],
      type: param,
      title: $(el).find('.common_w-card_title').text().trim(),
      viewNumber: parseFloat(_view),
      view: _view,
      platform: 'quanmin',
      live: true,
      anchor: $(el).find('.common_w-card_host-name').text().trim(),
      cover: $(el).find('img.common_w-card_cover').attr('src'),
    }

    rooms.push(room)
  });

  return rooms;
}

function zhanqiParse(datas, param, cb) {
  var data;

  try{
    data = JSON.parse(datas.body);
  }catch(e){
    return [];
  }
  if(!data.data.rooms.length) return [];
  var room, rooms = [];
  _.each(data.data.rooms, (el, index) => {
    var _view = el.online;
    if(_view < 100) return;
    var _live = true;

    room = {
      roomId: el.uid,
      type: param,
      title: el.title,
      viewNumber: parseFloat(_view),
      view: _view,
      platform: 'zhanqi',
      live: _live,
      anchor: el.nickname,
      cover: el.bpic,
    }
    rooms.push(room);
  })

  return rooms;
}

function pandaParse(datas, param, cb) {
  var data;

  try{
    data = JSON.parse(datas.body);
  }catch(e){
    return [];
  }
  if(!data.data.items.length) return [];
  var room, rooms = [];
  _.each(data.data.items, (el, index) => {
    var _view = el.person_num;
    if(_view < 200) return;
    var _live = true;

    room = {
      roomId: el.id,
      type: param,
      title: el.name,
      viewNumber: parseFloat(_view),
      view: _view,
      platform: 'panda',
      live: _live,
      anchor: el.userinfo.nickName,
      cover: el.pictures.img,
    }
    rooms.push(room);
  })

  return rooms;
}


exports.douyuParse = douyuParse;
exports.twitchParse = twitchParse;
exports.huomaoParse = huomaoParse;
exports.longzhuParse = longzhuParse;
exports.huyaParse = huyaParse;
exports.bilibiliParse = bilibiliParse;
exports.douyuvideoParse = douyuvideoParse;
exports.afreecatvParse = afreecatvParse;
exports.quanminParse = quanminParse;
exports.zhanqiParse = zhanqiParse;
exports.pandaParse = pandaParse;