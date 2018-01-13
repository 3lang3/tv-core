var http = require('https');
var fs = require('fs');
var privateKey  = fs.readFileSync('./server.key', 'utf8');
var certificate = fs.readFileSync('./server.pem', 'utf8');
var credentials = {key: privateKey, cert: certificate};
var server = http.createServer(credentials);
var express = require('express');
var router = express.Router();
var app = express();
var io = require('socket.io')(server);
var config = require('../config');
var superagent = require('superagent');

var ipTrackerUrl = '//int.dpool.sina.com.cn/iplookup/iplookup.php?format=json&ip=';

//在线用户
var onlineUsers = {};
//当前在线人数
var onlineCount = 0;

let trackHandler = (ip) => {
	return new Promise((resolve, reject) => {
		https://staticlive.douyucdn.cn/common/share/play.swf?room_id=423895
		superagent
			.get(`${ipTrackerUrl}${ip}`)
			.timeout(500)
			.end((err, res) => {
				if(err) {
					reject('error')
				}else {
					resolve(JSON.parse(res.text))
				}
			})
	})
}


io.on('connection', function (socket) {

  socket.on('login', async function (data) {
		//console.log(socket)
    var uid = socket.id
    socket.uid = uid;
    socket.user = data;
    socket.country = '';

    //检查在线列表，如果不在里面就加入
		if(!onlineUsers.hasOwnProperty(uid)) {
			onlineUsers[uid] = data.nickname;
			//在线人数+1
			onlineCount++;
		}
		
		// 获取用户区域信息
		var ip = socket.handshake.address;

		let ipInfo = await trackHandler(ip);

		if(ipInfo != '-3') data.ip = ipInfo;

		//向所有客户端广播用户加入
		io.emit('message:login', {type: 'log', onlineUsers:onlineUsers, onlineCount:onlineCount, user: data, text: `来啦`});
		console.log(data.nickname+'加入了聊天室');

  });

  //监听用户退出
	socket.on('disconnect', function(){
		//将退出的用户从在线列表中删除
		if(onlineUsers.hasOwnProperty(socket.uid)) {
			//退出用户的信息
			var obj = socket.user;
			
			//删除
			delete onlineUsers[socket.uid];
			//在线人数-1
			onlineCount--;
			
			//向所有客户端广播用户退出
			//io.emit('message:logout', {type: 'log', onlineUsers:onlineUsers, onlineCount:onlineCount, user: obj, text: `走啦`});
			console.log(obj.username+'退出了聊天室');
		}
	});

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

server.listen(config.ChatPort)

module.exports = router;
