var Electron = function(type) {

	this.type = type;

	this.angle = 0;
	this.bound = false;

	this.elem;
	this.electrons = [];

	this.highlight;
	this.highlightTl;

	this.loneHighlightHitArea;
	this.loneHighlight;
	this.loneHighlightTl;

	this.loneChecked = false;

	this.build = function() {

		var frag = document.createDocumentFragment();

		this.elem = DOMHELPER.create('g', {
			styles:{
				transformOrigin:'0 0'
			}, 
			classes:['electron'], 
			parent:frag
		});

		if(type == 'lone') {
			var e1 = DOMHELPER.create('circle', {
				attributes:{
					cx:0, 
					cy:0, 
					r:3
				}, 
				styles:{
					x:20, 
					y:-3.5, 
					transformOrigin:'0 0'
				}, 
				classes:['lone', 'no-select'], 
				parent:this.elem
			});

			var e2 = DOMHELPER.create('circle', {
				attributes:{
					cx:0, 
					cy:0, 
					r:3
				}, 
				styles:{
					x:20, 
					y:3.5, 
					transformOrigin:'0 0'
				}, 
				classes:['lone', 'no-select'], 
				parent:this.elem
			});

			this.electrons = [e1, e2];

			// Lone pair highlight
			this.loneHighlightHitArea = DOMHELPER.create('circle', {
				attributes:{
					fill:'transparent', 
					stroke:'none', 
					cx:0, 
					cy:0, 
					r:30
				}, 
				styles:{
					display:'none', 
					x:20, 
					y:0
				}, 
				classes:['hitarea'], 
				parent:this.elem
			});

			this.loneHighlight = DOMHELPER.create('circle', {
				attributes:{
					fill:'transparent', 
					stroke:'#ffffff', 
					'stroke-width':2, 
					cx:0, 
					cy:0, 
					r:20
				}, 
				styles:{
					x:20, 
					y:0, 
					opacity:1, 
					scale:0, 
					transformOrigin:'0 0'
				}, 
				classes:['lone-electron-highlight', 'no-select'], 
				parent:this.elem
			});

			// Construct electron highlight timeline
			this.loneHighlightTl = gsap.timeline({
				paused:true, 
				repeat:-1, 
				repeatDelay:0.25
			});

			this.loneHighlightTl.set(this.loneHighlight, {
				opacity:1, 
				scale:0
			});

			this.loneHighlightTl.to(this.loneHighlight, {
				duration:1, 
				opacity:0, 
				ease:'power2.in'
			}, 0);

			this.loneHighlightTl.to(this.loneHighlight, {
				duration:1, 
				scale:1, 
				ease:'power1.out'
			}, 0);
		}
		else {
			var e = DOMHELPER.create('circle', {
				attributes:{
					cx:0, 
					cy:0, 
					r:3
				}, 
				styles:{
					x:20, 
					y:0, 
					transformOrigin:'0 0'
				}, 
				classes:['free'], 
				parent:this.elem
			});

			this.highlight = DOMHELPER.create('circle', {
				attributes:{
					fill:'none', 
					stroke:'#ffffff', 
					'stroke-width':2, 
					cx:0, 
					cy:0, 
					r:8
				}, 
				styles:{
					x:20, 
					y:0, 
					opacity:1, 
					scale:0, 
					transformOrigin:'0 0'
				}, 
				classes:['electron-highlight'], 
				parent:this.elem
			});

			// Construct electron highlight timeline
			this.highlightTl = gsap.timeline({
				paused:true, 
				repeat:-1, 
				repeatDelay:1
			});

			this.highlightTl.set(this.highlight, {
				opacity:1, 
				scale:0
			});

			this.highlightTl.to(this.highlight, {
				duration:1, 
				opacity:0, 
				ease:'power2.in'
			}, 0);

			this.highlightTl.to(this.highlight, {
				duration:1, 
				scale:1, 
				ease:'power1.out'
			}, 0);

			this.electrons = [e];
		}

	}

	this.setClockAngle = function(clockAngle) {
		//this.angle = UTIL.mod((((clockAngle % 12) * 30) - 90), 360);
		this.angle = UTIL.mod((((clockAngle % 12) * 30) + 270), 360);
	}

	this.startHighlight = function() {
		this.highlightTl.seek(0);
		this.highlightTl.play();
	}

	this.stopHighlight = function() {
		this.highlightTl.pause();
		gsap.to(this.highlight, {
			duration:0.5, 
			opacity:0, 
			scale:0
		});
	}

}