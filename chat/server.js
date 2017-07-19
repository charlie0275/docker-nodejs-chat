var express = require("express"),
    app     = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use('/static', express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var onlineList = [];

var handleClient = function (socket) {
	console.log('connected');

	socket.on('input name', function(string){
		console.log(string);
		var userObj = JSON.parse(string);
		
		// 取得先前在線清單
		// 對於一個特定的 socket 傳訊息
		socket.emit("get online list", JSON.stringify(onlineList)); 
		
		onlineList.push(userObj);
		socket.userObj = userObj;
		socket.uuid = userObj.uuid;
		socket.name = userObj.name;
		
		// 對於除了目前這個 socket 之外所有線上的 socket 傳訊息
		socket.broadcast.emit("someone in", string); 
		socket.broadcast.emit('chat message', JSON.stringify({ msg: socket.name + ' 進入聊天室～', name: "系統訊息" }));
		
	});
  
	socket.on('disconnect', function(){
		console.log(socket.uuid + ' disconnected');
		io.sockets.emit('chat message', JSON.stringify({ msg: socket.name + ' 離開了聊天室～', name: "系統訊息" }));
		socket.broadcast.emit("someone out", socket.uuid);
		onlineList.splice(onlineList.indexOf(socket.userObj), 1);
	});
	
	socket.on('send message', function(msg){
		process.stdout.write(`${msg}\n`);
		// 對於所有線上 socket 傳訊息
		io.sockets.emit("chat message", JSON.stringify({ msg: msg, name: socket.name }));
	});
	
	socket.on('drop image', function (image) {
        io.sockets.emit('image', image, socket.name);
    });
}

io.on('connection', handleClient);

http.listen(3000, function(){
  console.log('listening on *:3000');
});