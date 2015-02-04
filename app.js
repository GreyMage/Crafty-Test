var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(80);
app.use(express.static(__dirname + "/www/"));

var LogicFPS = 50;
var LogicDelay = 1000 / LogicFPS;

// Object Types
function Player(id){
	this.id = id;
	this.x = 0;
	this.dx = 0;
	this.y = 0;
	this.dy = 0;
}

var cuddlePile = {};
var timeOut = {};
// Tick Cuddlepile
var timeDrift = new Date().getTime();
tickCuddlePile = function(){
	timeDrift += LogicDelay;
	var delay = LogicDelay - (new Date().getTime() - timeDrift)

	for(var i in cuddlePile){
		if("x" in cuddlePile[i] && "dx" in cuddlePile[i]) cuddlePile[i].x += cuddlePile[i].dx;
		if("y" in cuddlePile[i] && "dy" in cuddlePile[i]) cuddlePile[i].y += cuddlePile[i].dy;
	}
	
	setTimeout(function(){
		tickCuddlePile();
	},delay)
}
tickCuddlePile();

io.on('connection', function (socket) {
	socket.sd = {};
	socket.on("register",function(id){
		if(socket.sd.id) return;
		socket.sd.id = id;
		
		// Bring user out of timeout?
		if(id in timeOut){
			console.log("returning user timeOut");
			cuddlePile[id] = timeOut[id];
			delete timeOut[id];
		}
		
		if(id in cuddlePile){
			console.log("returning user cuddlePile");
		} else {
			cuddlePile[id] = new Player(id);
			console.log("new user");
		}
		socket.sd.player = cuddlePile[id];
		socket.broadcast.emit('twitch',socket.sd.player);
		
		// Attach Registered Events
		socket.on("disconnect",function(data){
			socket.sd.player.dx = 0;
			socket.sd.player.dy = 0;
			socket.broadcast.emit('twitch',socket.sd.player);
			socket.broadcast.emit('leave',socket.sd.player);
			console.log("putting user in timeout");
			timeOut[id] = cuddlePile[id];
			delete cuddlePile[id];
		});
		socket.on("twitch",function(data){
			socket.sd.player.x = data.x;
			socket.sd.player.y = data.y;
			socket.sd.player.dx = data.dx;
			socket.sd.player.dy = data.dy;
			socket.broadcast.emit('twitch',socket.sd.player);
		});
		
		// Send Login info
		socket.emit("zone",{
			actors:cuddlePile
		});
	});
});