'use strict';

var express = require('express');
var app = express();
var router = express.Router();
var passport = require('passport');
var cors = require('cors');
var dota2 = require("dota2");
var steam = require('steam');
var steamClient = new steam.SteamClient();
var Dota2 = new dota2.Dota2Client(steamClient, true);
var User = require('./../schema/User');
var config = require('../config')

// CORS headers
app.use(cors({
  origin: true,
  credentials: true,
}));

app.get('/loginSteam', passport.authenticate('steam', {
	failureRedirect: '/error'
}))

app.get('/login', passport.authenticate('local', {
	failureRedirect: '/error'
}), (req, res) => {
	return res.redirect(`${config.frontHost}`);
})

app.get('/returnSteam', passport.authenticate('steam', {
	failureRedirect: `${config.frontHost}/?steam=false`
}), (req, res) => {
	console.log(req.user)
	return res.redirect(`${config.frontHost}`);
})

app.get('/register', passport.authenticate('local', {
	failureRedirect: '/error'
}), (req, res) => {
	return res.redirect(`${config.frontHost}`);
})

app.route('/logout').get((req, res) => {
	req.logout();
	req.session = null;
	return res.redirect(`${config.frontHost}`);
});

module.exports = app;