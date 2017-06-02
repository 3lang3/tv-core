var http = require('http');
var server = http.createServer();
var express = require('express');
var router = express.Router();
var app = express();
var io = require('socket.io')(server);

io.on('connection', function (socket) {
  console.log('a user connected!');
  
  socket.on('message:send', function (data) {
    io.emit('message:receive', data)
  });

  socket.on('message:send:emoji', function (data) {
  	data.type = 'emoji';
    io.emit('message:receive', data)
  });

  socket.on('message:send:screen', function (data) {
    data.type = 'screen';
    io.emit('message:receive', data)
  });
});

server.listen(3001)

module.exports = router;
