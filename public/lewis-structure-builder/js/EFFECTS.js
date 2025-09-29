var EFFECTS = (function() {

	var canVibrate = typeof window.navigator.vibrate != 'undefined';

	var defaultVibrate = true;

	var defaultMinParticleSize = 2;
	var defaultMaxParticleSize = 6;

	var defaultMinParticles = 10;
	var defaultMaxParticles = 20;

	var defaultMinDist = 12;
	var defaultMaxDist = 30;

	var defaultMinExplodeDur = 0.2;
	var defaultMaxExplodeDur = 0.7;
	
	function explode(x, y, parent, options) {
		//console.log(x + ', ' + y);
		// Set defaults
		var vibrate = defaultVibrate;
		var min = defaultMinParticles;
		var max = defaultMaxParticles;
		var minSize = defaultMinParticleSize;
		var maxSize = defaultMaxParticleSize;
		var minDist = defaultMinDist;
		var maxDist = defaultMaxDist;
		var minDur = defaultMinExplodeDur;
		var maxDur = defaultMaxExplodeDur;
		var defaultColor = '#ffffff';

		var moveEase = 'power1.out';
		var fadeEase = 'power1.in';
		// ...

		// Look for overrides
		if(typeof options == 'object') {
			var o = options; // shorthand

			// Vibration
			if(typeof o.vibrate == 'boolean') vibrate = o.vibrate;

			// Number of particles
			if(typeof o.min == 'number') min = o.min;
			if(typeof o.max == 'number') max = o.max;
			
			// Particle size
			if(typeof o.minSize == 'number') minSize = o.minSize;
			if(typeof o.maxSize == 'number') maxSize = o.maxSize;

			// Particle travel distance
			if(typeof o.minDist == 'number') minDist = o.minDist;
			if(typeof o.maxDist == 'number') maxDist = o.maxDist;
			
			// Particle lifespan duration
			if(typeof o.minDur == 'number') minDur = o.minDur;
			if(typeof o.maxDur == 'number') maxDur = o.maxDur;
		}

		vibrate = vibrate && canVibrate;

		// Calculate up-front properties
		var num = UTIL.rand(min, max);

		// Create timeline
		var tl = gsap.timeline({
			onStart:function() {
				if(vibrate) window.navigator.vibrate(minDur * 1000);
			}
		});

		for(var i = 0; i < num; i++) {
			// Calculate per-particle properties
			let r = UTIL.rand(minSize, maxSize) * 0.5;
			let dist = UTIL.rand(minDist, maxDist);
			let dur = UTIL.rand(minDur, maxDur);

			// Create particle
			let particle = DOMHELPER.create('circle', {
				attributes:{
					cx:x, 
					cy:y, 
					r:r, 
					stroke:'none', 
					fill:defaultColor
				}, 
				styles:{
					x:0, 
					y:0, 
					transformOrigin:'0 0', 
					scale:0, 
					opacity:1
				}, 
				parent:parent
			});

			// Calculate destination
			var angle = UTIL.rand(0, 360);
			var dx = dist * Math.cos(angle);
			var dy = dist * Math.sin(angle);

			// Construct animation, add to timeline

			// Opacity & removal
			tl.to(particle, {
				duration:dur, 
				opacity:0, 
				ease:fadeEase, 
				onComplete:function() {
					parent.removeChild(particle);
				}
			}, 0);

			// Movement & scale
			tl.to(particle, {
				duration:dur, 
				x:dx, 
				y:dy, 
				scale:1, 
				ease:moveEase
			}, 0);
		}

		return tl;
	}

	function firework(x, y, parent, options) {
		//console.log(x + ', ' + y);
		// Set defaults
		var vibrate = true;
		var defaultColor = '#ffffff';

		// Initial explosion
		var minInitNum = 12;
		var maxInitNum = 16;
		var minInitSize = 10;
		var maxInitSize = 14;
		var minInitDist = 120;
		var maxInitDist = 160;
		var minInitTravelDur = 0.4;
		var maxInitTravelDur = 0.9;
		var minInitFadeDur = 0.15;
		var maxInitFadeDur = 0.3;

		// Sub-explosions
		var explosionDelay = 0.25;
		var minSubNum = 7;
		var maxSubNum = 10;
		var minSubSize = 4;
		var maxSubSize = 6;
		var minSubStartDist = 3;
		var maxSubStartDist = 35;
		var minSubFallDist = 8;
		var maxSubFallDist = 12;
		var minSubFadeDur = 0.15;
		var maxSubFadeDur = 0.25;
		var minFlickerNum = 2;
		var maxFlickerNum = 3;
		var minFlickerDelay = 0.1;
		var maxFlickerDelay = 0.4;
		
		// ...

		// Look for overrides
		if(typeof options == 'object') {
			var o = options; // shorthand

			// Vibration
			if(typeof o.vibrate == 'boolean') vibrate = o.vibrate;

			// Number of initial particles
			if(typeof o.minInitNum == 'number') minInitNum = o.minInitNum;
			if(typeof o.maxInitNum == 'number') maxInitNum = o.maxInitNum;
			
			// Particle initial size
			if(typeof o.minInitSize == 'number') minInitSize = o.minInitSize;
			if(typeof o.maxInitSize == 'number') maxInitSize = o.maxInitSize;

			// Particle initial travel distance
			if(typeof o.minInitDist == 'number') minInitDist = o.minInitDist;
			if(typeof o.maxInitDist == 'number') maxInitDist = o.maxInitDist;
			
			// Particle initial travel duration
			if(typeof o.minInitTravelDur == 'number') minInitTravelDur = o.minInitTravelDur;
			if(typeof o.maxInitTravelDur == 'number') maxInitTravelDur = o.maxInitTravelDur;

			// Particle initial fade duration
			if(typeof o.minInitFadeDur == 'number') minInitFadeDur = o.minInitFadeDur;
			if(typeof o.maxInitFadeDur == 'number') maxInitFadeDur = o.maxInitFadeDur;

			// Sub-explosion delay
			if(typeof o.explosionDelay == 'number') explosionDelay = o.explosionDelay;

			// Number of sub particles
			if(typeof o.minSubNum == 'number') minSubNum = o.minSubNum;
			if(typeof o.maxSubNum == 'number') maxSubNum = o.maxSubNum;

			// Sub particle size
			if(typeof o.minSubSize == 'number') minSubSize = o.minSubSize;
			if(typeof o.maxSubSize == 'number') maxSubSize = o.maxSubSize;

			// Sub particle start distance
			if(typeof o.minSubStartDist == 'number') minSubStartDist = o.minSubStartDist;
			if(typeof o.maxSubStartDist == 'number') maxSubStartDist = o.maxSubStartDist;

			// Sub particle fall distance
			if(typeof o.minSubFallDist == 'number') minSubFallDist = o.minSubFallDist;
			if(typeof o.maxSubFallDist == 'number') maxSubFallDist = o.maxSubFallDist;

			// Sub particle fade duration
			if(typeof o.minSubFadeDur == 'number') minSubFadeDur = o.minSubFadeDur;
			if(typeof o.maxSubFadeDur == 'number') maxSubFadeDur = o.maxSubFadeDur;

			// Sub particle flicker number
			if(typeof o.minFlickerNum == 'number') minFlickerNum = Math.round(o.minFlickerNum);
			if(typeof o.maxFlickerDelay == 'number') maxFlickerDelay = Math.round(o.maxFlickerDelay);

			// Sub particle flicker delay
			if(typeof o.minFlickerDelay == 'number') minFlickerDelay = o.minFlickerDelay;
			if(typeof o.maxFlickerDelay == 'number') maxFlickerDelay = o.maxFlickerDelay;
		}

		vibrate = vibrate && canVibrate;

		// Keep track of particles for removal
		var particles = [];

		// Calculate up-front properties
		var initNum = UTIL.rand(minInitNum, maxInitNum);

		// Create timeline
		var tl = gsap.timeline({
			onStart:function() {
				if(vibrate) window.navigator.vibrate(minInitTravelDur * 1000);
			}
		});

		for(let i = 0; i < initNum; i++) {
			// Calculate per-particle properties
			let initR = UTIL.rand(minInitSize, maxInitSize) * 0.5;
			let initDist = UTIL.rand(minInitDist, maxInitDist);
			let initTravelDur = UTIL.rand(minInitTravelDur, maxInitTravelDur);
			let initFadeDur = UTIL.rand(minInitFadeDur, maxInitFadeDur);

			// Create particle
			let initParticle = DOMHELPER.create('circle', {
				attributes:{
					cx:x, 
					cy:y, 
					r:initR, 
					stroke:'none', 
					fill:defaultColor
				}, 
				styles:{
					x:0, 
					y:0, 
					transformOrigin:'50% 50%', 
					scale:0, 
					opacity:1
				}, 
				classes:['firework-particle'], 
				parent:parent
			});

			particles.push(initParticle);

			// Calculate destination
			let initAngle = (i * (Math.PI * 2 / initNum)) + UTIL.rand(0, (Math.PI * 2 / initNum) * 0.5);
			let initDx = initDist * Math.cos(initAngle);
			let initDy = initDist * Math.sin(initAngle);

			// Construct animation, add to timeline

			// Movement & scale
			tl.to(initParticle, {
				duration:initTravelDur, 
				x:initDx, 
				y:initDy, 
				scale:1, 
				opacity:UTIL.rand(0.4, 0.9), 
				ease:'expo.out'
			}, 0);

			// Opacity fade
			tl.to(initParticle, {
				duration:initFadeDur, 
				opacity:0, 
				ease:'power1.in'
			}, initTravelDur);

			// Scale down
			tl.to(initParticle, {
				duration:initFadeDur + 0.15, 
				scale:0, 
				ease:'power1.in'
			}, initTravelDur - 0.15);

			//tl.addLabel('subExplosions', '+=' + explosionDelay);

			// Sub-explosions
			let subNum = UTIL.rand(minSubNum, maxSubNum);

			for(let j = 0; j < subNum; j++) {
				// Calculate per-particle properties
				let subR = UTIL.rand(minSubSize, maxSubSize) * 0.5;
				let subStartDist = UTIL.rand(minSubStartDist, maxSubStartDist);
				let subFallDist = UTIL.rand(minSubFallDist, maxSubFallDist);
				let subFadeDur = UTIL.rand(minSubFadeDur, maxSubFadeDur);
				let subFlickerNum = UTIL.randInt(minFlickerNum, maxFlickerNum);
				let subFlickerDelay = UTIL.rand(minFlickerDelay, maxFlickerDelay);

				let angle = UTIL.rand(0, Math.PI * 2);
				let dx = x + initDx + subStartDist * Math.cos(angle);
				let dy = y + initDy + subStartDist * Math.sin(angle);

				// Create particle
				let subParticle = DOMHELPER.create('circle', {
					attributes:{
						cx:dx, 
						cy:dy, 
						r:subR, 
						stroke:'none', 
						fill:defaultColor
					}, 
					styles:{
						x:0, 
						y:0, 
						transformOrigin:'0 0', 
						scale:0.5, 
						opacity:0
					}, 
					classes:['firework-particle'], 
					parent:parent
				});

				particles.push(subParticle);

				// Construct animation, add to timeline
				let subTl = gsap.timeline({
					onStart:function() {
						if(vibrate) window.navigator.vibrate(subFadeDur * 1000);
					}, 
					repeat:subFlickerNum, 
					delay:subFlickerDelay
				});

				// Scale up briefly and appear
				subTl.to(subParticle, {
					duration:subFadeDur * 0.25, 
					scale:1, 
					opacity:1, 
					ease:'power1.in'
				}, 0);

				// Scale down and fade
				subTl.to(subParticle, {
					duration:subFadeDur * 0.75, 
					scale:0, 
					opacity:0, 
					ease:'linear'
				}, subFadeDur * 0.75);

				// Fall down
				tl.to(subParticle, {
					duration:subFadeDur * subFlickerNum, 
					y:'+=' + subFallDist * subFlickerNum, 
					delay:subFlickerDelay, 
					ease:'linear'
				}, explosionDelay + initTravelDur + initFadeDur);

				tl.add(subTl, explosionDelay + initTravelDur + initFadeDur);

			}
			
		}

		tl.call(function() {
			var allParticles = parent.querySelectorAll('.firework-particle');
			if(allParticles.length > 0) {
				gsap.to(allParticles, {
					duration:0.25, 
					autoAlpha:0, 
					onComplete:function() {
						for(var i = 0; i < allParticles.length; i++) {
							allParticles[i].parentNode.removeChild(allParticles[i]);
						}
					}
				});
			}
		}, null, '+=1');

		return tl;
	}

	return {
		explode: explode, 
		firework: firework
	}

})();