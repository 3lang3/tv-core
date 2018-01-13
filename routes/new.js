var _ = require('lodash');
var request = require('request');
var async = require('async');
var cheerio = require('cheerio');
var platformConfig = require('../config/platform');
var parses = require('./parses');
var platforms = platformConfig.platforms;
var ScreenModal = require('../schema/Screen');

class Spider {
    constructor(option) {
        this.pageUrl = option.pageUrl;
        this.firstPageUrl = option.firstPageUrl || option.pageUrl;
        this.platform = option.platform;
        this.resultData = [];
    }

    init(callback) {
        console.log(`-------------------------------${this.platform} start`)
        async.waterfall([
            this.getPageCount.bind(this),
            this.getAllPage.bind(this),
        ], (err, result) => {
            var _result = _.flatten(result, true);

            // _result.forEach(item => ScreenModal.updateByScreen(item))
            var __result = [];
            _result.forEach(el => {
                __result.push({
                    updateOne: {
                        filter: { id: el.id },
                        update: {$set: el},
                        upsert: true,
                    }
                })
            })
            
            ScreenModal.find({platform: this.platform}).updateMany({ live: false }).exec(() => {
                console.time(`${this.platform} time`)
                ScreenModal.bulkWrite(__result, (err, r => {
                    console.timeEnd(`${this.platform} time`)
                    console.log(`-------------------------------${this.platform} database update finished!  data length is ${_result.length}`)
                    callback && callback(err, _result)
                }))
            })
        })
    }

    getPageCount(callback) {
        // console.log(`Staring get ${this.platform} page count...`)
        async.waterfall(
            [
                (cb) => {
                    fetchPage(this.firstPageUrl, cb)
                },
                (q, cb) => {
                    if(!q) return cb(null, 1);
                    var $, count;
                    try {
                        $ =  JSON.parse(q.body);

                    } catch (e) {
                        console.log('parse err', this.firstPageUrl)
                        try {
                            $ = cheerio.load(q.body);
                            
                        } catch (error) {
                            console.log(error, this.platform, this.pageUrl)
                        }
                    }

                    
                    count = eval(`parses.${this.platform}PageCount($)`);
                    console.log(`${this.platform} page count`, count)
                    cb(null, count > 100 ? 100 : count);
                }
            ], (err, result) => {
                callback(null, result)
            }
        )
    }

    getPageData(url, next) {
        let _url;
        if(this.platform == 'quanmin') {
            _url = `${this.pageUrl}${url + 1}.json`;
        }else if(this.platform == 'zhanqi'){
            _url = `${this.pageUrl}${url + 1}.json`;
        }else if(this.platform == 'panda') {
            _url = `${this.pageUrl}${url + 1}`;
        }else if(this.platform == 'bilibili') {
            _url = `${this.pageUrl}${url + 1}`;
        }else if(this.platform == 'douyu') {
            _url = `${this.pageUrl}${url + 1}`;
        }else if(this.platform == 'longzhu') {
            _url = `http://api.plu.cn/tga/streams?max-results=50&sort-by=views&filter=0&start-index=${url}`;
        }else {
            _url = `${this.pageUrl}&page=${url + 1}`;
        }
        
        // console.log(`Staring get ${this.platform} page ${_url}...`)
        async.waterfall(
            [
                (cb) => {
                    fetchPage(_url, cb)
                },
                (q, cb) => {
                    if(!q) return cb(null, []);
                    var datas = [];

                    datas.push(eval(`parses.${this.platform}Parse(q, cb)`));
                    cb(null,  _.flatten(datas, true));
                }
            ], (err, result) => {
                next(err, result)
            }
        )
    }

    getAllPage(pageCount, callback) {

        async.timesLimit(pageCount, 2, this.getPageData.bind(this), (err, result) => {
            callback(null, result)
        })
    }

}

function fetchPage(url, cb) {
    if (url == '') return cb(null, false);

    var options = {
        url: url,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36'
        },
        timeout: 5000,
    };
    request(options, (err, res, body) => {
        if (err) {
            console.log('fetch page err:', url)
            cb(null, false);
        } else {
            cb(null, res);
        }
    })
}

module.exports = Spider;