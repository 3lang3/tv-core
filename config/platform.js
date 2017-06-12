let config = require('./index');

module.exports = {
    gameType: [
        'dota2',
        'lol',
        'csgo',
        'tvgame',
        'hearthstone',
        'overwatch',
        'starcraft',
        'girls',
        'all',
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
            href: `https://api.twitch.tv/kraken/streams?limit=60&client_id=${config.twitchKey}&game=`,
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
            name: 'zhanqi',
            href: `https://www.zhanqi.tv/api/static/v2.1/game/live/`,
            minView: 100,
        },
        {
            name: 'bilibili',
            href: `http://api.live.bilibili.com/area/liveList?order=online&area=`,
            minView: 0,
        },
    ]
}