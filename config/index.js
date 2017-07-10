let domain = require('./domain');
const isProd = process.env.NODE_ENV === 'production';

module.exports = {
    frontHost: isProd ? `http://${domain}` : `http://${domain}:8080`,
    endHost: `http://${domain}:3000/`,
    Host: 'localhost',
    openDotaApiHost: 'https://api.opendota.com/api/',
    mongodbUri: `//${domain}/`,
    mongodbName: 'tv',
    steamKey: 'E0D3B44CFEA428B96F97616D00874255',
    twitchKey: 'b126oamqxmzf2rbuh2smmoumpgscjf',
    sessionMaxAge: 52 * 7 * 24 * 60 * 60 * 1000,
    sessionSecret: 'testsecretvalue',
    ChatPort: 3001,
    InviteCode: 'testcode',
    version: '2.0.0',
}