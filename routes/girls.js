'use strict';

var _ = require('lodash');
var request = require('request');
var async = require('async');
var cheerio = require('cheerio');
var parses = require('./parses');

var platforms = [
	{name: 'douyu', href: 'http://www.douyu.com/directory/game/yz'},
  {name: 'douyuvideo', href: 'https://v.douyu.com/video/video/listData?page=1&cate1Id=3&cate2Id=18&action=num'},
  {name: 'douyuvideo', href: 'https://v.douyu.com/video/video/listData?page=1&cate1Id=3&cate2Id=25&action=num'},
  {name: 'douyuvideo', href: 'https://v.douyu.com/video/video/listData?page=1&cate1Id=3&cate2Id=24&action=num'},
  {name: 'huomao', href: 'http://www.huomao.com/channels/channel.json?page=1&page_size=120&game_url_rule=ylxx'},
	{name: 'huya', href: `http://www.huya.com/cache.php?m=LiveList&do=getLiveListByPage&gameId=1663`},
	{name: 'quanmin', href: `http://www.quanmin.tv/game/showing`},
	{name: 'zhanqi', href: `https://www.zhanqi.tv/api/static/v2.1/game/live/65/100/1.json`},
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

      return datas.push(eval(`parses.${platform.name}Parse(results[index], 'girls', cb)`));

  })

	return datas;
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
module.exports = girlSFetchEnginer;