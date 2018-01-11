let config = require('./index');

module.exports = {
    gameType: [
        {
            name: 'all',
            name_cn: '全部直播',
            name_en: 'All Channel',
        },
        {
            name: 'moive',
            name_cn: '电影频道',
            name_en: 'Moive Channel',
        },
        {
            name: 'dota2',
            name_cn: '刀塔2',
            name_en: 'Dota 2',
        },
        {
            name: 'lol',
            name_cn: '英雄联盟',
            name_en: 'League of Legends',
        },
        {
            name: 'csgo',
            name_cn: '反恐精英-全球进攻',
            name_en: 'Counter-Strike: Global Offensive',
        },
        {
            name: 'wow',
            name_cn: '魔兽世界',
            name_en: 'World Of Warcraft',
        },
        {
            name: 'tvgame',
            name_cn: '主机游戏',
            name_en: 'TV Game',
        },
        {
            name: 'hok',
            name_cn: '王者荣耀',
            name_en: 'Honour of Kings',
        },
        {
            name: 'hearthstone',
            name_cn: '炉石',
            name_en: 'Hearthstone',
        },
        {
            name: 'overwatch',
            name_cn: '守望先锋',
            name_en: 'Overwatch',
        },
        {
            name: 'fight',
            name_cn: '格斗游戏',
            name_en: 'Fighting Games',
        },
        {
            name: 'starcraft',
            name_cn: '星际争霸',
            name_en: 'Starcraft',
        },
        {
            name: 'outdoor',
            name_cn: '户外频道',
            name_en: 'Outdoor Channel',
        },
        {
            name: 'girls',
            name_cn: '娱乐频道',
            name_en: 'Girls Channel',
        }
    ],
    platforms: [
        {
            name: 'douyu',
            href: `http://www.douyu.com/directory/game/`,
            minView: 500,
        },
        {
            name: 'huomao',
            href: `http://www.huomao.com/channels/channel.json?page=1&page_size=120&game_url_rule=`,
            minView: 500,
        },
        {
            name: 'twitch',
            href: `https://api.twitch.tv/kraken/streams?limit=100&client_id=${config.twitchKey}&game=`,
            minView: 80,
        },
        {
            name: 'huya',
            href: `http://www.huya.com/cache.php?m=LiveList&do=getLiveListByPage&gameId=`,
            minView: 100,
        },
        {
            name: 'quanmin',
            href: `http://www.quanmin.tv/game/`,
            minView: 100,
        },
        {
            name: 'panda',
            href: `https://www.panda.tv/ajax_sort?token=&pageno=1&pagenum=120&classification=`,
            minView: 100,
        },
        // {
        //     name: 'zhanqi',
        //     href: `https://www.zhanqi.tv/api/static/v2.1/game/live/`,
        //     minView: 100,
        // },
        {
            name: 'longzhu',
            href: `http://api.plu.cn/tga/streams?max-results=100&start-index=0&sort-by=views&filter=0&game=`,
            minView: 100,
        },
        {
            name: 'bilibili',
            href: `http://api.live.bilibili.com/area/liveList?order=online&area=`,
            minView: 0,
        },
    ],
    newPlatform: [
        {
            platform: 'huya',
            name: '虎牙',
            pageUrl: 'http://www.huya.com/cache.php?m=LiveList&do=getLiveListByPage&tagAll=0',
            firstPageUrl: 'http://www.huya.com/l',
            imgUrl: 'https://www.huya.com/g',
        },
        {
            platform: 'douyu',
            name: '斗鱼',
            pageUrl: 'https://www.douyu.com/gapi/rkc/directory/0_0/',
            firstPageUrl: 'https://www.douyu.com/directory/all',
            imgUrl: 'https://www.douyu.com/directory',
        },
        {
            platform: 'huomao',
            name: '火猫',
            pageUrl: 'https://www.huomao.com/channels/channel.json?page_size=120&game_url_rule=all&page=1',
            firstPageUrl: 'https://www.huomao.com/channels/channel.json?page_size=120&game_url_rule=all',
            imgUrl: 'https://www.huomao.com/game',
        },
        {
            platform: 'longzhu',
            name: '龙珠',
            pageUrl: 'http://api.plu.cn/tga/streams?max-results=50&sort-by=views&filter=0&start-index=',
            imgUrl: 'http://longzhu.com/games/?from=fiallgames',
        },
        {
            platform: 'quanmin',
            name: '全民',
            pageUrl: 'http://www.quanmin.tv/json/play/list_',
            firstPageUrl: 'http://www.quanmin.tv/json/play/list.json',
            imgUrl: 'https://www.quanmin.tv/category/',
        },
        {
            platform: 'zhanqi',
            name: '战旗',
            firstPageUrl: 'https://www.zhanqi.tv/api/static/v2.1/live/list/120/1.json',
            pageUrl: 'https://www.zhanqi.tv/api/static/v2.1/live/list/120/',
            imgUrl: 'https://www.zhanqi.tv/games',
        },
        {
            platform: 'panda',
            name: '熊猫',
            firstPageUrl: 'http://www.panda.tv/live_lists?status=2&order=person_num&pageno=1&pagenum=120',
            pageUrl: 'http://www.panda.tv/live_lists?status=2&order=person_num&pagenum=120&pageno=',
            imgUrl: 'https://www.panda.tv/cate',
        },
        {
            platform: 'bilibili',
            name: 'bilibili',
            firstPageUrl: 'http://api.live.bilibili.com/area/home?area=all&order=online&cover=1',
            pageUrl: 'http://api.live.bilibili.com/area/liveList?area=all&order=online&page=',
        }
    ]
}
