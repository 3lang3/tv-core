let config = require('./index');

module.exports = {
    gameType: [
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
            name: 'starcraft',
            name_cn: '星际争霸',
            name_en: 'Starcraft',
        },
        {
            name: 'girls',
            name_cn: '娱乐频道',
            name_en: 'Girls Channel',
        },
        {
            name: 'all',
            name_cn: '全部直播',
            name_en: 'All Channel',
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
    ]
}