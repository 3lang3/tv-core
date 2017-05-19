var http = require('http');
var server = http.createServer();
var express = require('express');
var router = express.Router();
var app = express();
var io = require('socket.io')(server);

io.on('connection', function (socket) {
  console.log('a user connected!');
  socket.emit('news', { hello: 'world' });
  socket.on('message:send', function (data) {
    console.log(data);
    io.emit('message:receive', data)
  });
  socket.on('message:send:emoji', function (data) {
  	data.type = 'emoji';
    io.emit('message:receive', data)
  });
});

server.listen(3001)

module.exports = router;
