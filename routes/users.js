'use strict';

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var superagent = require('superagent');
var async = require('async');
var cheerio = require('cheerio');

var platforms = {
	douyu: 'https://www.douyu.com/directory/game/'
}
/* GET home page. */
router.get('/category', (req, res, next) => {
	res.json({});
});
module.exports = router;
