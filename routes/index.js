var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET home page. */
router.get('/category', function(req, res, next) {
  res.json({
  	roomId: 339610,
  	type: 'dota2',
  	title: 'Test title',
  	view: '13.4w',
  	platform: 'Douyu',
  	anchor: 'yyf'
  })
});

module.exports = router;
