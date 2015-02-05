Crafty.c('Position', {
	init: function() {
		this.attr({
			w: 16,
			h: 16
		})
	},
	
	// Motion
	dx:0,
	dy:0,
	
	// Locate this entity at the given position on the grid
	at: function(x, y) {
		if (x === undefined && y === undefined) {
			return { x: this.x, y: this.y }
		} else {
			this.attr({ x: x, y: y });
			return this;
		}
	}
}); 

// An "Actor" is an entity that is drawn in 2D on canvas
Crafty.c('Actor', {
	init: function() {
		this.requires('2D, Canvas, Position, Color').color('rgb(20, 75, 40)');
	},
});

// A Tree is just an Actor with a certain sprite
Crafty.c('Player', {
	motionResolution:1000,
	init: function() {
		this.requires('Actor, Color, Tween').color('rgb(20, 75, 40)');
		this.bind('EnterFrame',this.EnterFrame);
		this.origin(this.x/2,this.y/2);
	},
	EnterFrame: function(data){
		this.shift(this.dx,this.dy);
	},
	playerID:""
});

Crafty.c('LocalPlayer', {
	init: function() {
		this.requires('Player, Fourway, Keyboard').color('rgb(80, 75, 40)').fourway(3);
		this.bind('NewDirection',this.twitch);
		this.bind('KeyDown', this.KeyDown);
	},
	KeyDown: function(){
		var me = this;
		if(this.isDown("SPACE")) {
			console.log("jump?");
			
		}
	},
	twitch:function(data){
		Game.socket.emit("twitch",{
			x:this.x,
			y:this.y,
			dx:data.x,
			dy:data.y
		});
	},
});