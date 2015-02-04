var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(80);
app.use(express.static(__dirname + "/www/"));

var LogicFPS = 50;
var LogicDelay = 1000 / LogicFPS;

var zone = {
	actors:[
		{
			x:200,
			y:140
		}
	]
}

// Object Types
function Player(id){
	this.id = id;
	this.x = 0;
	this.dx = 0;
	this.y = 0;
	this.dy = 0;
}

var cuddlePile = {};
// Tick Cuddlepile
var timeDrift = new Date().getTime();
tickCuddlePile = function(){
	timeDrift += LogicDelay;
	var delay = LogicDelay - (new Date().getTime() - timeDrift)

	for(var i in cuddlePile){
		cuddlePile[i].x += cuddlePile[i].dx;
		cuddlePile[i].y += cuddlePile[i].dy;
	}
	
	setTimeout(function(){
		tickCuddlePile();
	},delay)
}
tickCuddlePile();

io.on('connection', function (socket) {
	socket.sd = {};
	socket.on("register",function(id){
		socket.sd.id = id;
		if(id in cuddlePile){
			console.log("returning user",cuddlePile[id]);
		} else {
			cuddlePile[id] = new Player(id);
			console.log("new user");
		}
		socket.sd.player = cuddlePile[id];
		
		// Attach Registered Events
		socket.on("disconnect",function(data){
			socket.sd.player.dx = 0;
			socket.sd.player.dy = 0;
			socket.broadcast.emit('twitch',socket.sd.player);
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