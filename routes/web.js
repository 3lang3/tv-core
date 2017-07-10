'use strict';

var app = require('./oauth');
var passport = require('passport');
var dota2 = require("dota2");
var steam = require('steam');
var steamClient = new steam.SteamClient();
var Dota2 = new dota2.Dota2Client(steamClient, true);
var User = require('../schema/User');
var config = require('../config')

// steam oauth
app.get('/loginSteam', passport.authenticate('steam', {
	failureRedirect: '/error'
}))

// steam oauth reback
app.get('/returnSteam', passport.authenticate('steam', {
	failureRedirect: `${config.frontHost}/login/false`
}), (req, res) => {
	return res.redirect(`${config.frontHost}`);
})

// local login
app.get('/login', passport.authenticate('local', {
	failureRedirect: `${config.frontHost}/login/false`
}), (req, res) => {
	return res.redirect(`${config.frontHost}`);
})

// local register
app.get('/register', passport.authenticate('local', {
	failureRedirect: `${config.frontHost}/register/false`
}), (req, res) => {
	return res.redirect(`${config.frontHost}`);
})

// logout session
app.route('/logout').get((req, res) => {
	req.logout();
	req.session = null;
	return res.redirect(`${config.frontHost}`);
});


module.exports = app;