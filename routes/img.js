var _ = require('lodash');
var fs = require('fs');
var request = require('request');
var async = require('async');
var cheerio = require('cheerio');
var platformConfig = require('../config/platform');
var parses = require('./parses');
var platforms = platformConfig.platforms;
var ScreenModal = require('../schema/Screen');

const FetchImg = (url, name) => {
    return new Promise( async (resolve, reject) => {
        let html = await fetchPage(url);
        let $ = cheerio.load(html);
        let result = eval(`${name}ImgPaser($)`);

        for(let img of result) {
            console.log('正在下载' + img.url);
            await download(img.url, './public/images', img.name);
        }

        resolve()
    })
}

const download = (url, dir, filename) => {
    return new Promise((resolve, reject) => {
        if(filename.indexOf(':') > -1) filename = filename.replace(':', '-');
        fs.exists(`${dir}/${filename}.jpg`, (exists) => {
            exists ? filename = filename + Math.floor(Math.random()*1000000) : '';

            request(url)
                .on('error', err => {
                    console.log(url, 'download false.')
                    resolve()
                })
                .pipe(fs.createWriteStream(`${dir}/${filename}.jpg`))
                
                .on('close', () => {
                    console.log('done.')
                    resolve()
                })
        })

        // request.head(url, (err, res, body) => {
		// 	request(url).pipe(fs.createWriteStream(dir + "/" + filename));
		// });
        

    })
};

function fetchPage(url) {

    var options = {
        url: url,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36'
        }
    };

    return new Promise((resolve, reject) => {
        request(options, (err, res, body) => {
            
            if (err) {
                reject(err);
            } else {
                resolve(body);
            }
    
        })
    })

}

const douyuImgPaser = ($) => {
    let result = [];

    $('a.thumb').each((index, el) => {
        result.push({
            name: $(el).find('p.title').text(),
            url: $(el).find('img').data('original'),
        })
    })
    
    return result;
}

const huyaImgPaser = ($) => {
    let result = [];

    $('li.game-list-item').each((index, el) => {
        result.push({
            name: $(el).find('.title').text(),
            url: 'http:'+ $(el).find('img').data('original'),
        })
    })
    
    return result;
}

const huomaoImgPaser = ($) => {
    let result = [];

    $('.game-smallbox').each((index, el) => {
        result.push({
            name: $(el).find('p').text(),
            url: $(el).find('img').data('original'),
        })
    })
    
    return result;
}

const longzhuImgPaser = ($) => {
    let result = [];

    $('.list-item-thumb').each((index, el) => {
        result.push({
            name: $(el).find('img').attr('alt'),
            url: $(el).find('img').attr('src'),
        })
    })
    
    return result;
}

const quanminImgPaser = ($) => {
    let result = [];

    $('a.list_w-card').each((index, el) => {
        result.push({
            name: $(el).find('img').attr('alt'),
            url: $(el).find('img').attr('src'),
        })
    })
    
    return result;
}

const zhanqiImgPaser = ($) => {
    let result = [];

    $('.js-game-list-item').each((index, el) => {
        result.push({
            name: $(el).find('img').attr('alt'),
            url: $(el).find('img').attr('src'),
        })
    })
    
    return result;
}

const pandaImgPaser = ($) => {
    let result = [];

    $('.video-list-item-wrap').each((index, el) => {
        result.push({
            name: $(el).find('img').attr('alt'),
            url: $(el).find('img').attr('src'),
        })
    })
    
    return result;
}

module.exports = FetchImg;