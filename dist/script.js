var w = c.width = 600,
		h = c.height = 600,
		ctx = c.getContext( '2d' ),
		
		opts = {
			shotBaseDelay: 10,
			shotAddedDelay: 8,
			radius: 400,
			bulletVel: 1,
			bulletAcc: .1, 
			targetSpeed: 2,
			
			targetSpawnDelay: 18,
			
			turretBarrelLength: 15,
			turretBarrelWidth: 5,
			turretRadius: 10,
			targetBaseSquareSize: 10,
			targetAddedSquareSize: 3,
			targetBaseShine: 50,
			targetAddedShine: 5,
			baseTargetRotSpeed: .08,
			addedTargetRotSpeed: .01,
			baseTargetResizeSpeed: .08,
			addedTargetResizeSpeed: .01,
			baseTargetShineSpeed: .08,
			addedTargetShineSpeed: .01,
			
			targetDespawnDelay: 40,
			targetDespawnCircleWidth: 3,
			
			targetParticles: 3,
			targetParticleDistance: 10,
			targetParticleSize: 5,
			
			turretParticleRadius: 4,
			turretInnerEmptyRadius: 6,
			
			backgroundColor: 'rgba(20,20,20,.1)',
			turretBaseColor: 'rgba(230,230,230,1)',
			turretBarrelColor: '#fff',
			turretParticleTemplateColor: 'hsla(hue,100%,40%,1)',
			bulletColor: '#eee',
			templateTargetSquareColor: 'hsl(hue,80%,light%)',
			templateTargetSquareAlpColor: 'hsla(hue,80%,light%,alp)'
		},
		
		tau = Math.PI * 2,
		tick = 0,
		
		turret,
		bullets = [],
		targets = [];

function Turret(){
	
	this.dir = 
	this.dirTarget =
	this.dirDelta =
	this.tick = 0;
	
	this.delay = 0;
	this.target;
	
	this.genTarget();
	this.pickTarget();
}
Turret.prototype.genTarget = function(){
	
	targets.push( new Target( Math.random() * tau ) );
}
Turret.prototype.shoot = function(){
	
	if( !this.rest )
		bullets.push( new Bullet( this.target ) );
	
	this.pickTarget();
}
Turret.prototype.pickTarget = function(){
	
	this.delay = opts.shotBaseDelay + opts.shotAddedDelay * Math.random() |0;
	this.tick = 0;
	
	var i = 0;
	while( i < targets.length && ( targets[ i ].len > 200 || targets[ i ].targeted ) )
		++i;
	
	this.rest = i >= targets.length;
	
	if( this.rest )
		return -1;
	
	this.target = targets[ i ];
	this.target.targeted = true;
	this.dir = this.dirTarget;
	this.dirTarget = this.target.ang;
	this.dirDelta = this.dirTarget - this.dir;
	if( this.dirDelta > Math.PI )
		this.dirDelta -= tau;
	if( this.dirDelta < -Math.PI )
		this.dirDelta += tau;
}
Turret.prototype.update = function(){
	
	++this.tick;
	
	if( this.tick > this.delay )
		this.shoot();
}
Turret.prototype.render = function(){
	
	var linear = this.rest ? 1 : this.tick / this.delay,
			armonic = -Math.cos( linear * Math.PI ) / 2 + .5,
			
			angle = this.dir + this.dirDelta * armonic;
	
	ctx.fillStyle = opts.turretBarrelColor;
	ctx.rotate( angle );
	ctx.fillRect( opts.turretInnerEmptyRadius, -opts.turretBarrelWidth / 2, opts.turretBarrelLength - opts.turretInnerEmptyRadius, opts.turretBarrelWidth );
	ctx.rotate( -angle );
	
	ctx.fillStyle = opts.turretBaseColor;
	ctx.beginPath();
	ctx.arc( 0, 0, opts.turretRadius, 0, tau );
	ctx.arc( 0, 0, opts.turretInnerEmptyRadius, 0, tau, true );
	ctx.fill();
	
	ctx.fillStyle = opts.turretParticleTemplateColor.replace( 'hue', tick );
	ctx.beginPath();
	ctx.arc( 0, 0, opts.turretParticleRadius, 0, tau );
	ctx.fill();
}
function Bullet( target ){
	
	var cos = Math.cos( target.ang ),
	    sin = Math.sin( target.ang );
	
	this.target = target;
	
	this.len = opts.turretBarrelLength;
	this.px = cos * this.len;
	this.py = sin * this.len;
	
	this.vel = opts.bulletVel;
	this.vx = cos * opts.bulletVel;
	this.vy = sin * opts.bulletVel;
	
	// this.acc = opts.bulletAcc;
	this.ax = cos * opts.bulletAcc;
	this.ay = sin * opts.bulletAcc;
}
Bullet.prototype.update = function(){
	
	this.len += this.vel += opts.bulletAcc;
	this.px += this.vx += this.ax;
	this.py += this.vy += this.ay;
	
	if( this.len >= this.target.len ){
		this.target.getHit();
		this.dead = true;
	}
	
}
Bullet.prototype.render = function(){
	
	ctx.lineWidth = opts.turretBarrelWidth / ( this.vel / opts.bulletVel );
	ctx.beginPath();
	ctx.moveTo( this.px, this.py );
	ctx.lineTo( this.px - this.vx * 2, this.py - this.vy * 2 );
	ctx.stroke();
}

function Target( ang ){
	
	var cos = Math.cos( ang ),
			sin = Math.sin( ang );
	
	this.ang = ang;
	this.cos = cos;
	this.sin = sin;
	
	this.len = opts.radius;
	this.px = cos * opts.radius;
	this.py = sin * opts.radius;
	
	// this.vel = opts.targetSpeed;
	this.vx = cos * -opts.targetSpeed;
	this.vy = sin * -opts.targetSpeed;
	
	this.tick = 0;
	this.color = opts.templateTargetSquareColor.replace( 'hue', ang / tau * 360 );
	this.alpColor = opts.templateTargetSquareAlpColor.replace( 'hue', ang / tau * 360 );
	
	this.rotateSpeed = opts.baseTargetRotSpeed + opts.addedTargetRotSpeed * Math.random();
	this.resizeSpeed = opts.baseTargetResizeSpeed + opts.addedTargetResizeSpeed * Math.random();
	this.shineSpeed = opts.baseTargetShineSpeed + opts.addedTargetShineSpeed * Math.random();
}
Target.prototype.update = function(){
	
	if( this.hit )
		return this.updateHit();
	
	this.len -= opts.targetSpeed;
	
	this.px += this.vx;
	this.py += this.vy;
	
	++this.tick;
}
Target.prototype.getHit = function(){
	
	this.hit = true;
	
	this.tick = 0;
}
Target.prototype.updateHit = function(){
	
	++this.tick;
	
	if( this.tick > opts.targetDespawnDelay )
		this.dead = true;
	
}
Target.prototype.render = function(){
	
	if( this.hit )
		return this.renderHit();
	
	var ang = this.tick * this.rotateSpeed,
			size = opts.targetBaseSquareSize + opts.targetAddedSquareSize * Math.cos( this.resizeSpeed * this.tick );
	
	ctx.fillStyle = this.color.replace( 'light', opts.targetBaseShine + opts.targetAddedShine * Math.cos( this.shineSpeed * this.tick ) );;
	ctx.translate( this.px, this.py );
	ctx.rotate( ang );
	ctx.fillRect( -size / 2, -size / 2, size, size );
	ctx.rotate( -ang );
	ctx.translate( -this.px, -this.py );
	
	for( var i = 0; i < opts.targetParticles; ++i ){
		
		var len = Math.random() * opts.targetParticleDistance,
				ang = Math.random() * tau,
				size = Math.random() * opts.targetParticleSize;
		
		ctx.fillRect( this.px + len * Math.cos( ang ) - size / 2, this.py + len * Math.sin( ang ) - size / 2, size, size );
	}
}
Target.prototype.renderHit = function(){
	
	var linear = this.tick / opts.targetDespawnDelay,
			armonic = -Math.cos( linear * Math.PI ) / 2 + .5;
	
	ctx.fillStyle = this.alpColor.replace( 'light', 25 + 75 * ( 1 - linear ) ).replace( 'alp', .3 * ( 1 - linear ) );
	var spacing = opts.targetDespawnCircleWidth * armonic;
	ctx.beginPath();
	ctx.arc( 0, 0, this.len, 0, tau );
	ctx.arc( -this.cos * spacing, -this.sin * spacing, this.len - spacing, 0, tau, true );
	ctx.fill();
}

function anim(){
	
	window.requestAnimationFrame( anim );
	
	++tick;
	
	ctx.fillStyle = opts.backgroundColor;
	ctx.fillRect( 0, 0, w, h );
	
	if( tick % opts.targetSpawnDelay === 0 )
		turret.genTarget();
	
	ctx.translate( w / 2, h / 2 );
	
	turret.update();
	targets.map( function( target ){ target.update(); } );
	bullets.map( function( bullet ){ bullet.update(); } );
	for( var i = 0; i < bullets.length; ++i )
		if( bullets[ i ].dead ){
			bullets.splice( i, 1 );
			--i;
		}
	for( var i = 0; i < targets.length; ++i )
		if( targets[ i ].dead ){
			targets.splice( i, 1 );
			--i;
		}
	
	ctx.fillStyle = 'rgb(30,30,30)';
	ctx.beginPath();
	ctx.arc( 0, 0, opts.turretBarrelLength, 0, tau );
	ctx.arc( 0, 0, opts.turretRadius - 1, 0, tau, true );
	ctx.fill();
	turret.render();
	ctx.globalCompositeOperation = 'lighter';
	ctx.strokeStyle = opts.bulletColor;
	targets.map( function( target ){ target.render(); } );
	bullets.map( function( bullet ){ bullet.render(); } );
	ctx.globalCompositeOperation = 'source-over';
	
	ctx.translate( -w / 2, -h / 2 );
}

turret = new Turret();
ctx.fillStyle = '#222';
ctx.fillRect( 0, 0, w, h );
anim();