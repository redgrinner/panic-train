var fHz = 1000/60; // The update frequency
var explosions = []; // List of on-going explosions

/*
 * Explosion Class
 * A class to create explosions on the HTML5 canvas.
 */
ExplosionClass = Class.extend({
	
	particles: [], // List of particles in the explosion
	
	ctx: null, // the canvas context to which the explosion will be drawn
	
	_killed: false, // flag indicating if the explosion is done

	// Initialise the explosion.
	// Input parameter:
	// - x and y coordinates
	// - List of particle colors
	init: function( x, y, colors, pSize ) {
		for ( var i = 0; i < colors.length; i++ ) {
			this.createExplosion(x, y, colors[i], pSize);
		}
	},
	
	// Create an explosion for a particular color at the
	// the coordinates x and y.
	createExplosion: function(x, y, color, pSize) {
		// Number of particles to use
		var numParticles = 7; //7 //12
		
		// Particle size parameters
		// Controls the size of the particle.
		var minSize = 1; //5 
		var maxSize = pSize; //3 //20
		
		// Particle speed parameters
		// Controls how quickly the particle
		// speeds outwards from the blast center.
		var minSpeed = 60.0;
		var maxSpeed = 100.0; //400.0
		
		// Scaling speed parameters
		// Controls how quickly the particle shrinks.
		var minScaleSpeed = 1.0;
		var maxScaleSpeed = 4.0;

		// Uniformly distribute the particles in a circle
		for ( var angle=0; angle<360; angle += Math.round(360/numParticles) ) {
			
			// Create a new particle
			var particle = new ParticleClass();
			
			// Assign the parent for callback purposes
			particle.parent = this;
			
			// Set the position of the particle
			particle.pos.x = x;
			particle.pos.y = y;
			
			// Set the particle size as a random value
			// between minSize and maxSize
			particle.radius = Math.randomFloat(minSize, maxSize);
			
			// Set the particle's color
			particle.color = color;

			// Set the scale speed. This is a random value
			// between minScaleSpeed and maxScaleSpeed
			particle.scaleSpeed = Math.randomFloat(minScaleSpeed, maxScaleSpeed);

			// Get a random speed value between minSpeed and maxSpeed
			var speed = Math.randomFloat(minSpeed, maxSpeed);
			
			// Set the velocity of the particle
			particle.velocity.x = speed * Math.cos(angle * Math.PI / 180.0);
			particle.velocity.y = speed * Math.sin(angle * Math.PI / 180.0);

			// Add the particle to the list of particles in the explosion
			this.particles.push(particle);
		}
	},
	
	// Remove a particle from the list of particles in the explosion.
	// The function is called by the particle's kill function.
	removeParticle: function(particle) {
		this.particles.erase(particle);
	},
	
	// Update all particles
	update: function() {
		if ( this.particles.length <= 0) {
			this.kill();
			return;	
		}
		
		for ( var i = 0; i < this.particles.length; i++) {
			this.particles[i].update();
		}
	},
	
	// Draw all particles
	draw: function() {
		for ( var i = 0; i < this.particles.length; i++) {
			this.particles[i].draw();
		}
	},
	
	// Destroy this explosion instance
	kill: function() {
		this._killed = true;
	}
});

/*
 * Particle Class
 * Represents a particle in an explosion. It includes functions to update
 * the state of the particle during the explosion.
 */
ParticleClass = Class.extend({

	pos: {x: 0, y: 0},  // The coordinates of the particle.
	
	radius: 20, // The radius of the particle.
	
	color: "#000000", // RGB color value of particle (hexadecimal notation).
	
	scale: 1.0,  // Scaling value between 0.0 and 1.0, initialized to 1.0.
	scaleSpeed: 0.5, // Amount per second to be deduced from the scale property.
	
	velocity: {x: 0, y: 0}, // Amount to be added per second to the particle’s position.
	
	parent: null, // The parent object controlling the explosion
	
	// Update the size and position of the particle
	update: function() {
		var ms = fHz;
		
		// Shrink the particle based on the scaleSpeed value
		this.scale -= this.scaleSpeed * ms / 1000.0;

		if (this.scale <= 0)
		{
			this.scale = 0;
			this.kill();
			return;
		}
		// moving away from explosion center
		this.pos.x += this.velocity.x * ms/1000.0;
		this.pos.y += this.velocity.y * ms/1000.0;
	},

	// Draws the particle on the canvas
	draw: function() {
		var ctx = this.parent.ctx;
		
		ctx.save();
		
		// translating the 2D context to the particle coordinates
		
		//we switched to scrolling, so positions need to update 
		//ctx.translate(this.pos.x, this.pos.y);
			ctx.translate(this.pos.x, this.pos.y);
		ctx.scale(this.scale, this.scale);

		// drawing a filled circle in the particle's local space
		ctx.beginPath();
		ctx.arc(0, 0, this.radius, 0, Math.PI*2, true);
		ctx.closePath();

		ctx.fillStyle = this.color;
		ctx.fill();

		ctx.restore();
	},
	
	// Destroy the particle
	kill: function(){
		this.parent.removeParticle(this);
	}
});

/*
 * Explosion Class
 * A class to create explosions on the HTML5 canvas.
 */
function getMousePos(event, src_elem){
	var totalOffsetX = 0;
	var totalOffsetY = 0;
	var x_pos = 0;
	var y_pos = 0;
	var currElement = src_elem;

	// IE, Chrome
	if ( event.offsetX !== undefined && event.offsetY !== undefined ) {
		x_pos = event.offsetX;
		y_pos = event.offsetY;
	}

	// Firefox
	else {
		do{
			totalOffsetX += currElement.offsetLeft - currElement.scrollLeft;
			totalOffsetY += currElement.offsetTop - currElement.scrollTop;
		}
		while(currElement = currElement.offsetParent)

		x_pos = event.pageX - totalOffsetX - document.body.scrollLeft; 
		y_pos = event.pageY - totalOffsetY - document.body.scrollTop;
	}
	
	return {x: x_pos, y: y_pos};
}

/*
 * randomFloat
 * Augments the Math library with a function
 * to generate random float values between
 * a given interval.
 */
Math.randomFloat = function(min, max){
	return min + Math.random()*(max-min);
};

/*
 * removeExplosion
 * Remove an explosion object from the explosions list.
 */
function removeExplosion(explosion) {
	return explosions.erase(explosion);
}

/*
 * The init function called when the page loads.
 * It setup up the event listener for mouseup
 * events and sets the interval to call the update
 * function.
 */
function init(){

	//
    // Add an mouseup event listener to the canvas object
    //
	
    /*
	canvas.addEventListener('mouseup', function(e){
		// The mouse position of the event
		var mouse_pos = getMousePos(e, this);
		
		// The canvas object
		var canvas = document.getElementById('canvas');
		
		// The canvas context
		var ctx = canvas.getContext('2d');
		
		// Colors used for the explosion
		var explosion_colors = ['#696359', '#F02E2E', '#FFAF2E'];
	
		// Create a new explosion
		var explosion = new ExplosionClass(mouse_pos.x, mouse_pos.y, explosion_colors);
		explosion.ctx = ctx;
		
		// Add the explosion to the explosions list.
		explosions.push(explosion);
			
	}, false);
	*/
	
	//
	// Create an interval that calls the update function 60 times a second
	//
	window.setInterval(update, 1000 / 60);
	
}

/*
 * update
 * Clears the canvas and calls the update and draw
 * function of elements in the explosions list.
 */
function exp_update() {
	
	var canvas = document.getElementById('primaryCanvas');
	var ctx = canvas.getContext('2d');
	
	var num_explosions = 0;
	var num_particles = 0;
	var deferred_kills = [];
	
	// Clear the canvas context
	//ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	// First update the explosions
	for ( var i = 0; i < explosions.length; i++ ) {
		explosions[i].update();
		if(explosions[i]._killed)
			deferred_kills.push(explosions[i]);
	}
	
	// Remove any explosions that are completed
	for ( var i = 0; i < deferred_kills.length; i++ ) {
		removeExplosion(deferred_kills[i]);
	}
	
	// Then draw them
	for ( var i = 0; i < explosions.length; i++ ) {
		explosions[i].draw();
		num_explosions++;
		num_particles += explosions[i].particles.length;
	}
	
	ctx.save()
	//ctx.font = 'normal 15pt Helvetica';
	//ctx.fillText('Explosions: ' + num_explosions + ' | Particles: ' + num_particles,
	//			 20,
	//			 canvas.height-20);
	ctx.restore();
}