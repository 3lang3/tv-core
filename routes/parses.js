var cheerio = require('cheerio');
var _ = require('lodash');
// var ScreenModal = require('../schema/Screen');
// var Screen = new ScreenModal()

function douyuParse(datas, cb) {
  var data;
  try{
    data = JSON.parse(datas.body);
  }catch(e){
      return []; 
  }

 if(data.msg !== 'success') return [];
 var room, rooms = [];
 _.each(data.data.rl, (el, index) => {
    room = {
      id: 'douyu' + el.rid,
      roomId: el.rid,
      type: el.c2name,
      title: el.rn,
      viewNumber: el.ol,
      view: el.ol,
      url: 'https://www.douyu.com'+el.url,
      platform: 'douyu',
      live: true,
      anchor: el.nn,
      cover: el.rs1,
    }
    rooms.push(room);
  })

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
      id: 'douyuvideo' + _id,
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
      id: 'twitch' + el.channel.name,
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
    if(_view < 100) return;

    room = {
      id: 'huomao' + el.room_number,
      roomId: el.room_number,
      type: el.gameCname,
      title: el.channel,
      viewNumber: parseFloat(_view),
      view: el.views,
      platform: 'huomao',
      url: 'https://www.huomao.com/' + el.room_number,
      live: el.is_live,
      anchor: el.nickname || el.username,
      cover: el.image,
    }

    rooms.push(room);
  })

  return rooms;
}

function longzhuParse(datas, cb) {
  var data;

  try{
    data = JSON.parse(datas.body);
  }catch(e){
    return [];
  }
  if(!data.data.items.length) return [];
  var room, rooms = [];
  _.each(data.data.items, (el, index) => {
    if(!el.game[0].name) console.log(el)
    room = {
      id: 'longzhu' + el.channel.id,
      roomId: el.channel.id,
      type: el.game[0].name,
      title: el.channel.status,
      url: el.channel.url,
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
    if(_view < 500) return;
    var _live = true;
  
    room = {
      id: 'huya' + el.privateHost,
      roomId: el.privateHost,
      type: el.gameFullName,
      title: el.roomName,
      viewNumber: _view,
      view: _view,
      url: 'http://www.huya.com/' + el.privateHost,
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
    if(_view < 100) return;
    var _live = true;

    room = {
      id: 'bilibili' + el.roomid,
      roomId: el.roomid,
      type: el.areaName,
      title: el.title,
      viewNumber: parseFloat(_view),
      view: _view,
      platform: 'bilibili',
      live: _live,
      url: 'https://live.bilibili.com/' + el.roomid,
      anchor: el.uname,
      cover: el.user_cover || el.system_cover,
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
      id: 'afreecatv' + el.title_no,
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
  var data;
  try{
    data = JSON.parse(datas.body);
  }catch(e){
    return [];
  }

  if(!data.data.length) return [];
  var room, rooms = [];
  _.each(data.data, (el, index) => {
  	var _view = el.view;

    room = {
      id: 'quanmin' + el.liveId,
      roomId: el.liveId,
      type: el.category_name,
      title: el.title,
      url: 'https://www.quanmin.tv/' + el.no,
      viewNumber: parseFloat(_view),
      view: el.view,
      platform: 'quanmin',
      live: true,
      anchor: el.nick,
      cover: el.live_thumb || el.recommend_new_image,
    }

    rooms.push(room);
  })

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
      id: 'zhanqi' + el.id,
      roomId: el.id,
      type: el.fatherGameName,
      title: el.title,
      url: 'https://www.zhanqi.tv' + el.url,
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
      id: 'panda' + el.id,
      roomId: el.id,
      type: el.classification.cname,
      title: el.name,
      viewNumber: parseFloat(_view),
      view: _view,
      platform: 'panda',
      live: _live,
      url: 'https://www.panda.tv/' + el.id,
      anchor: el.userinfo.nickName,
      cover: el.pictures.img,
    }

    rooms.push(room);
  })

  return rooms;
}


function douyuPageCount($) {
  return $('.classify_li a').eq(0).attr('data-pagecount');
}

function huyaPageCount($) {
  return $('#js-list-page').attr('data-pages');
}

function longzhuPageCount($) {
  if(!$.data.items.length) return [];
  
  return Math.ceil($.data.totalItems / 50)
}

function huomaoPageCount($) {

  if(!$.status) return [];

  return Math.ceil($.data.allCount / 120)
}

function quanminPageCount($) {
  
    if(!$.data.length) return [];
  
    return Math.ceil($.total / 120)
}

function zhanqiPageCount($) {
  
    if(!$.data.rooms.length) return [];
  
    return Math.ceil($.data.cnt / 120)
}

function pandaPageCount($) {
  
    if(!$.data.items.length) return [];
  
    return Math.ceil($.data.total / 120)
}

function bilibiliPageCount($) {
  
  if(!$.data.list.length) return [];
  
    return Math.ceil($.data.total / 30)
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

exports.douyuPageCount = douyuPageCount;
exports.huyaPageCount = huyaPageCount;
exports.longzhuPageCount = longzhuPageCount;
exports.huomaoPageCount = huomaoPageCount;
exports.quanminPageCount = quanminPageCount;
exports.zhanqiPageCount = zhanqiPageCount;
exports.pandaPageCount = pandaPageCount;
exports.bilibiliPageCount = bilibiliPageCount;
