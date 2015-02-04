Game = {

	// The total width of the game screen. Since our grid takes up the entire screen
	//  this is just the width of a tile times the width of the grid
	width: function() {
		return 800;
	},

	// The total height of the game screen. Since our grid takes up the entire screen
	//  this is just the height of a tile times the height of the grid
	height: function() {
		return 600;
	},
	
	getId: function(){
		var mid = localStorage.getItem("gameid");
		if(!mid){
			localStorage.setItem("gameid",Game.uid(36));
			return Game.getId();
		}
		return mid;
	},
	
	uid: function(digits){
		var x = Math.floor(Math.random() * 36).toString(36);
		if(digits > 1) return x + Game.uid(digits-1);
		return x;
	},

	// Initialize and start our game
	start: function() {
		// Start crafty and set a background color so that we can see it's working
		Crafty.init(Game.width(), Game.height());
		Crafty.background('rgb(87, 109, 20)');
		
		console.log(Game.getId());
		//OPEN THE PORTAL
		Game.socket = io.connect();
		Game.socket.emit("register",Game.getId());
		Game.socket.on('zone', function (data) {
			console.log("zone",data);
			if(data.actors){
				for(var i in data.actors){
					var T = 'Player';
					if(Game.getId() == data.actors[i].id) T = 'LocalPlayer';
					var newbie = Crafty.e(T).at(data.actors[i].x, data.actors[i].y);
					newbie.playerID = data.actors[i].id;
				}
			}
		});
		Game.socket.on('twitch', function (data) {
			console.log("twitching",data)
			var players = Crafty("Player").get();
			for(var i in players){
				var pl = players[i];
				if(pl.playerID != data.id) continue;
				console.log(pl);
				pl.x = data.x;
				pl.y = data.y;
				pl.dx = data.dx;
				pl.dy = data.dy;
				return;
			}
			// didnt find a guy to twitch? make one.
			var newbie = Crafty.e('Player').at(data.x, data.y);
			newbie.playerID = data.id;
		});
		Game.socket.on('leave', function (data) {
			console.log("leave",data)
			var players = Crafty("Player").get();
			for(var i in players){
				var pl = players[i];
				if(pl.playerID != data.id) continue;
				pl.destroy();
				return;
			}
		});
				
	}
};

var magnitude = function(n){
	if(n>0)return 1;
	if(n<0)return -1;
	return 0;
}

$text_css = { 'size': '24px', 'family': 'Arial', 'color': 'red', 'text-align': 'center' };