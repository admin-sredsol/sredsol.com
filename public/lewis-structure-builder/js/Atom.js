var Atom = function(elementSymbol, numElectrons, numLonePairs) {

	this.symbol = elementSymbol;
	this.numElectrons = numElectrons;
	this.numLonePairs = numLonePairs;
	this.numFreeElectrons = numElectrons - (2 * numLonePairs);

	this.type = 'atom';

	this.elem;

	this.backgroundRadius = 25;
	this.backgroundCircle;
	this.symbolElem;
	this.symbolElemOutline;

	this.dragHitAreaRadius = this.backgroundRadius + (APPLICATION.gridSpacing - this.backgroundRadius) * 0.25;
	this.dragHitAreaCircle;

	this.electrons = [];

	this.connectedAtoms = [];

	this.draggable;
	this.dragging = false;
	this.moving = false;
	this.bonding = false;
	this.bondingEnabled = false;

	// Electron orientations
	this.electronN = null;
	this.electronE = null;
	this.electronS = null;
	this.electronW = null;

	// Atom neighbors
	this.neighborN = null;
	this.neighborNE = null;
	this.neighborE = null;
	this.neighborSE = null;
	this.neighborS = null;
	this.neighborSW = null;
	this.neighborW = null;
	this.neighborNW = null;

	// Atom bonds
	this.bondN = null;
	this.bondNE = null;
	this.bondE = null;
	this.bondSE = null;
	this.bondS = null;
	this.bondSW = null;
	this.bondW = null;
	this.bondNW = null;

	// Parent, if applicable (molecules or groups of atoms get added to a G element)
	this.parentMolecule = null;

	// Bonding drag elements
	this.bondDragElems = [];
	this.bondTrailElems = [];
	this.bondDraggables = [];

	this.posX = 0;
	this.posY = 0;

	this.feedbackTooFar = 0;
	this.feedbackNoFreeElectrons = 0;
	this.feedbackNoFreeElectronsH = 0;
	this.feedbackNoFreeElectronsN = 0;
	this.feedbackNoFreeElectronsO = 0;
	this.feedbackNoFreeElectronsF = 0;
	this.feedbackNoFreeElectronsCl = 0;
	this.feedbackNoFreeElectronsBr = 0;
	this.feedbackTooManyBonds = 0;


	this.build = function() {

		var frag = document.createDocumentFragment();

		this.elem = DOMHELPER.create('g', {
			classes:['atom'], 
			parent:frag
		});

		// Hit area circle
		this.dragHitAreaCircle = DOMHELPER.create('circle', {
			styles:{
				transformOrigin:'0 0', 
				scale:1
			}, 
			attributes:{
				cx:0, 
				cy:0, 
				r:this.dragHitAreaRadius, 
				stroke:'none', 
				//fill:'hsla(0, 100%, 100%, 0.2)', 
				fill:'transparent'
			}, 
			parent:this.elem
		});

		// Background circle
		this.backgroundCircle = DOMHELPER.create('circle', {
			styles:{
				strokeOpacity:0.75, 
				strokeWidth:1
			}, 
			attributes:{
				cx:0, 
				cy:0, 
				r:this.backgroundRadius, 
				fill:'hsla(0, 100%, 100%, 0.5)', 
			}, 
			classes:['atom-background'],
			parent:this.elem
		});

		// Symbol / Letter
		this.symbolElemShadow = DOMHELPER.create('text', {
			attributes:{
				x:0, 
				y:(20 * 0.5 - 3.5)
			}, 
			classes:['symbol', 'symbol-outline', 'no-select'], 
			parent:this.elem
		});
		this.symbolElemShadow.innerHTML = this.symbol;

		this.symbolElem = DOMHELPER.create('text', {
			attributes:{
				x:0, 
				y:(20 * 0.5 - 3.5)
			}, 
			classes:['symbol', 'no-select'], 
			parent:this.elem
		});
		this.symbolElem.innerHTML = this.symbol;

		// Build electrons depending on element type
		if(this.symbol == 'H') {
			DOMHELPER.addClass(this.elem, 'hydrogen');
			this.elem.setAttribute('data-atom-type', 'hydrogen');

			var electronTypes = [
				'normal'
			];

			for(var i = 0; i < electronTypes.length; i++) {
				var e = new Electron(electronTypes[i]);
				e.build();
				this.elem.appendChild(e.elem);
				this.electrons.push(e);
			}
		}
		else if(this.symbol == 'C') {
			DOMHELPER.addClass(this.elem, 'carbon');
			this.elem.setAttribute('data-atom-type', 'carbon');

			var electronTypes = [
				'normal', 
				'normal', 
				'normal', 
				'normal'
			];

			for(var i = 0; i < electronTypes.length; i++) {
				var e = new Electron(electronTypes[i]);
				e.build();
				this.elem.appendChild(e.elem);
				this.electrons.push(e);
			}
		}
		else if(this.symbol == 'N') {
			DOMHELPER.addClass(this.elem, 'nitrogen');
			this.elem.setAttribute('data-atom-type', 'nitrogen');

			var electronTypes = [
				'lone', 
				'normal', 
				'normal', 
				'normal'
			];

			for(var i = 0; i < electronTypes.length; i++) {
				var e = new Electron(electronTypes[i]);
				e.build();
				this.elem.appendChild(e.elem);
				this.electrons.push(e);
			}
		}
		else if(this.symbol == 'O') {
			DOMHELPER.addClass(this.elem, 'oxygen');
			this.elem.setAttribute('data-atom-type', 'oxygen');

			var electronTypes = [
				'lone', 
				'normal', 
				'lone', 
				'normal'
			];

			for(var i = 0; i < electronTypes.length; i++) {
				var e = new Electron(electronTypes[i]);
				e.build();
				this.elem.appendChild(e.elem);
				this.electrons.push(e);
			}
		}
		else if(this.symbol == 'F') {
			DOMHELPER.addClass(this.elem, 'fluorine');
			this.elem.setAttribute('data-atom-type', 'fluorine');

			var electronTypes = [
				'lone', 
				'lone', 
				'normal', 
				'lone'
			];

			for(var i = 0; i < electronTypes.length; i++) {
				var e = new Electron(electronTypes[i]);
				e.build();
				this.elem.appendChild(e.elem);
				this.electrons.push(e);
			}
		}
		else if(this.symbol == 'Cl') {
			DOMHELPER.addClass(this.elem, 'chlorine');
			this.elem.setAttribute('data-atom-type', 'chlorine');

			var electronTypes = [
				'lone', 
				'lone', 
				'normal', 
				'lone'
			];

			for(var i = 0; i < electronTypes.length; i++) {
				var e = new Electron(electronTypes[i]);
				e.build();
				this.elem.appendChild(e.elem);
				this.electrons.push(e);
			}
		}
		else if(this.symbol == 'Br') {
			DOMHELPER.addClass(this.elem, 'bromine');
			this.elem.setAttribute('data-atom-type', 'bromine');

			var electronTypes = [
				'lone', 
				'lone', 
				'normal', 
				'lone'
			];

			for(var i = 0; i < electronTypes.length; i++) {
				var e = new Electron(electronTypes[i]);
				e.build();
				this.elem.appendChild(e.elem);
				this.electrons.push(e);
			}
		}

		// Init electron positions
		this.initElectrons();


		// Draggable instance
		this.draggable = Draggable.create(this.elem, {
			type:'x,y', 
			bounds:APPLICATION.bounds, 
			edgeResistance:0.5, 
			inertia:true, 
			callbackScope:this, 
			atom:this, 
			snap:{
				points:function(point) {
					//console.log(point)
					var atom = this.vars.atom;
					var nearestOffset = (APPLICATION.gridWidth % 2) * (APPLICATION.gridSpacing * 0.5);
					var nearestX = parseInt(Math.round((point.x + nearestOffset) / APPLICATION.gridSpacing) * APPLICATION.gridSpacing - nearestOffset);
					var nearestY = parseInt(Math.round((point.y + nearestOffset) / APPLICATION.gridSpacing) * APPLICATION.gridSpacing - nearestOffset);

					// Additional bounds correction
					if(nearestX < APPLICATION.bounds.minX) nearestX = APPLICATION.bounds.minX;
					if(nearestX > APPLICATION.bounds.maxX) nearestX = APPLICATION.bounds.maxX;
					if(nearestY < APPLICATION.bounds.minY) nearestY = APPLICATION.bounds.minY;
					if(nearestY > APPLICATION.bounds.maxY) nearestY = APPLICATION.bounds.maxY;

					// Look for nearest open position
					//var nearestOpenPosition = APPLICATION.getNearestOpenPosition(
					var nearestOpenPosition = APPLICATION.getNearestOpenPositionGeneric(
						atom, 
						{ // target position
							x:nearestX, 
							y:nearestY
						}, 
						{ // start position
							x:this.startX, 
							y:this.startY
						}
					);

					atom.posX = nearestOpenPosition.x;
					atom.posY = nearestOpenPosition.y;

					//console.log(nearestOpenPosition);

					return nearestOpenPosition;
				}
			}, 
			onPress:function(e) {
				this.dragging = true;
				APPLICATION.dragging = true;
				//console.log('onPress');
				//APPLICATION.debugLog('onPress');
			}, 
			onRelease:function(e) {
				this.dragging = false;
				APPLICATION.updateAtomsDragging();
				this.follow();
			}, 
			onDrag:function(e) {
				this.dragging = true;
				this.moving = true;
				APPLICATION.dragging = true;
			}, 
			onDragEnd:function(e) {
				this.dragging = false;
				APPLICATION.updateAtomsDragging();
				this.follow();
			}, 
			onThrowComplete:function(e) {
				this.dragging = false;
				this.moving = false;
				APPLICATION.updateAtomsDragging();
				this.follow();
			}, 
			overshootTolerance:0.5
		}).pop();

		this.elem.addEventListener('click', function(e) {
			e.preventDefault();
			e.stopPropagation();
		});

	}

	this.initBonds = function() {

		// Bond elements and draggable instances
		for(var i = 0; i < this.numFreeElectrons; i++) {
			// Dragger elem
			/*let bondDragElem = DOMHELPER.create('g', {
				classes:['no-select'], 
				parent:this.elem.parentNode
			});

			let bondDragCircle = DOMHELPER.create('circle', {
				attributes:{
					cx:0, 
					cy:0, 
					r:25, 
					//fill:'transparent'
					fill:'hsla(290, 100%, 80%, 0.2)'
				}, 
				parent:bondDragElem
			});*/

			let bondDragElem = DOMHELPER.create('circle', {
				styles:{
					autoAlpha:0, 
					'stroke-opacity':0
				}, 
				attributes:{
					cx:0, 
					cy:0, 
					r:this.backgroundRadius, 
					fill:'transparent', 
					stroke:'#ffffff', 
					'stroke-width':'2', 
					//fill:'hsla(290, 100%, 80%, 0.2)'
				}, 
				classes:['no-select', 'bond-drag'], 
				parent:this.elem.parentNode
			});

			this.bondDragElems.push(bondDragElem);

			// Suppress further click events from passing through (double-tap)
			bondDragElem.addEventListener('click', function(e) {
				e.preventDefault();
				e.stopPropagation();
			});

			// Drag trail
			let bondTrailElem = DOMHELPER.create('path', {
				attributes:{
					'stroke':'#ffffff', 
					'stroke-width':'2px', 
					'stroke-linecap':'round', 
					'stroke-dasharray':'2 4', 
					'data-color':'#ffffff', 
					d:'M 0 0'
				}, 
				classes:['no-select', 'bond-trail'], 
				parent:this.elem.parentNode
			});

			this.bondTrailElems.push(bondTrailElem);

			// Draggable instance
			let bondDraggable = Draggable.create(bondDragElem, {
				type:'x,y', 
				atom:this, 
				drag:bondDragElem, 
				dragging:false, 
				active:false, 
				targetAtom:null, 
				feedbackTooFar:false, 
				feedbackNoFreeElectrons:false, 
				feedbackNoFreeElectronsH:false, 
				feedbackNoFreeElectronsN:false, 
				feedbackNoFreeElectronsO:false, 
				feedbackNoFreeElectronsF:false, 
				feedbackNoFreeElectronsCl:false, 
				feedbackNoFreeElectronsBr:false, 
				feedbackTooManyBonds:false, 
				feedbackErrors:false, 
				trail:bondTrailElem, 
				onPressInit:function(e) {
					//console.log(e);
					//console.log(this);
					//console.log('atom: ' + this.vars.atom.getPosX() + ' ' + this.vars.atom.getPosY()); // SVG-space
					gsap.set(this.target, {
						//x:
					});
				}, 
				onPress:function(e) {
					//console.log(e);
					//console.log(this);
					//console.log('atom: ' + this.vars.atom.getPosX() + ' ' + this.vars.atom.getPosY());
					var atom = this.vars.atom;
					atom.dragging = true;
					this.vars.dragging = true;
					this.vars.targetAtom = null;
					APPLICATION.dragging = true;
				}, 
				onRelease:function(e) {
					var atom = this.vars.atom;
					this.vars.dragging = false;
					APPLICATION.updateAtomsDragging();
				}, 
				onDrag:function(e) {
					var atom = this.vars.atom;
					atom.dragging = true;
					this.vars.dragging = true;
					APPLICATION.dragging = true;

					//console.log(this.x + ', ' + this.y); // SVG-space
					//console.log(e);
					//console.log(this);

					// Show dragger
					gsap.set(this.vars.drag, {
						'stroke-opacity':0.3
					});

					// Update trail path
					gsap.set(this.vars.trail, {
						attr:{
							d:'M 0 0 ' + (this.x - atom.getPosX()) + ' ' + (this.y - atom.getPosY())
						}
					});

					// Hit test against other atoms
					var hit = false;
					var color = '#ffffff'; // no hit

					for(var j = 0; j < APPLICATION.atoms.length; j++) {
						var otherAtom = APPLICATION.atoms[j];

						// Ignore self
						if(atom === otherAtom) continue;

						// Check for a hit
						if(this.hitTest(otherAtom.elem)) {
							hit = true;
							// Red or green, depending on available free electrons

							var feedback = atom.checkBondErrors(otherAtom);

							this.vars.feedbackNoFreeElectrons = feedback.noFreeElectrons;
							this.vars.feedbackNoFreeElectronsH = feedback.noFreeElectronsH;
							this.vars.feedbackNoFreeElectronsN = feedback.noFreeElectronsN;
							this.vars.feedbackNoFreeElectronsO = feedback.noFreeElectronsO;
							this.vars.feedbackNoFreeElectronsF = feedback.noFreeElectronsF;
							this.vars.feedbackNoFreeElectronsCl = feedback.noFreeElectronsCl;
							this.vars.feedbackNoFreeElectronsBr = feedback.noFreeElectronsBr;
							this.vars.feedbackTooFar = feedback.tooFar;
							this.vars.feedbackTooManyBonds = feedback.tooManyBonds;

							this.vars.feedbackErrors = [
								this.vars.feedbackNoFreeElectrons, 
								this.vars.feedbackNoFreeElectronsH, 
								this.vars.feedbackNoFreeElectronsN, 
								this.vars.feedbackNoFreeElectronsO, 
								this.vars.feedbackNoFreeElectronsF, 
								this.vars.feedbackNoFreeElectronsCl, 
								this.vars.feedbackNoFreeElectronsBr, 
								this.vars.feedbackTooFar, 
								this.vars.feedbackTooManyBonds
							].reduce(function(acc, val) {
								return acc || val;
							});
							//this.vars.feedbackTooFar || this.vars.feedbackNoFreeElectrons || this.vars.feedbackTooManyBonds;

							if(this.vars.feedbackErrors) {
								color = '#cc0000'; // invalid
							}
							else {
								color = '#4dff94'; // valid
							}

							APPLICATION.updateFeedback();

							break;
						}
					}

					// If no hits across any atoms, reset
					if(!hit) {
						this.vars.feedbackNoFreeElectrons = false;
						this.vars.feedbackNoFreeElectronsH = false;
						this.vars.feedbackNoFreeElectronsN = false;
						this.vars.feedbackNoFreeElectronsO = false;
						this.vars.feedbackNoFreeElectronsF = false;
						this.vars.feedbackNoFreeElectronsCl = false;
						this.vars.feedbackNoFreeElectronsBr = false;
						this.vars.feedbackTooFar = false;
						this.vars.feedbackTooManyBonds = false;

						APPLICATION.updateFeedback();
					}

					// Update trail color
					if(this.vars.trail.getAttribute('data-color') != color) {
						gsap.set(this.vars.trail, {
							stroke:color, 
							attr:{
								'data-color':color
							}
						});
					}
				}, 
				onDragEnd:function(e) {
					var atom = this.vars.atom;

					// Hide dragger
					gsap.set(this.vars.drag, {
						'stroke-opacity':0
					});

					// Check for making bond
					for(var j = 0; j < APPLICATION.atoms.length; j++) {
						var otherAtom = APPLICATION.atoms[j];

						// Ignore self
						if(atom === otherAtom) continue;

						if(this.hitTest(otherAtom.elem)) {

							// See if atom is eligible for making a bond
							var feedback = atom.checkBondErrors(otherAtom);

							this.vars.feedbackNoFreeElectrons = feedback.noFreeElectrons;
							this.vars.feedbackNoFreeElectronsH = feedback.noFreeElectronsH;
							this.vars.feedbackNoFreeElectronsN = feedback.noFreeElectronsN;
							this.vars.feedbackNoFreeElectronsO = feedback.noFreeElectronsO;
							this.vars.feedbackNoFreeElectronsF = feedback.noFreeElectronsF;
							this.vars.feedbackNoFreeElectronsCl = feedback.noFreeElectronsCl;
							this.vars.feedbackNoFreeElectronsBr = feedback.noFreeElectronsBr;
							this.vars.feedbackTooFar = feedback.tooFar;
							this.vars.feedbackTooManyBonds = feedback.tooManyBonds;

							console.log(feedback);

							// See if atom is eligible for making a bond
							var errors = [
								feedback.noFreeElectrons, 
								feedback.noFreeElectronsH, 
								feedback.noFreeElectronsN, 
								feedback.noFreeElectronsO, 
								feedback.noFreeElectronsF, 
								feedback.noFreeElectronsCl, 
								feedback.noFreeElectronsBr, 
								feedback.tooFar, 
								feedback.tooManyBonds
							].reduce(function(acc, val) {
								return acc || val;
							});

							console.log(errors);

							//if(feedback.noFreeElectrons == false && feedback.tooFar == false && feedback.tooManyBonds == false) {
							if(!errors) {
								this.vars.targetAtom = otherAtom;
								atom.makeBond(otherAtom);
								this.vars.targetAtom = null;
								break;
							}
							else {
								APPLICATION.updateFeedback();
							}
						}
						else {
							this.vars.feedbackNoFreeElectrons = false;
							this.vars.feedbackNoFreeElectronsH = false;
							this.vars.feedbackNoFreeElectronsN = false;
							this.vars.feedbackNoFreeElectronsO = false;
							this.vars.feedbackNoFreeElectronsF = false;
							this.vars.feedbackNoFreeElectronsCl = false;
							this.vars.feedbackNoFreeElectronsBr = false;
							this.vars.feedbackTooFar = false;
							this.vars.feedbackTooManyBonds = false;

							APPLICATION.updateFeedback();
						}
					}

					this.vars.feedbackNoFreeElectrons = false;
					this.vars.feedbackNoFreeElectronsH = false;
					this.vars.feedbackNoFreeElectronsN = false;
					this.vars.feedbackNoFreeElectronsO = false;
					this.vars.feedbackNoFreeElectronsF = false;
					this.vars.feedbackNoFreeElectronsCl = false;
					this.vars.feedbackNoFreeElectronsBr = false;
					this.vars.feedbackTooFar = false;
					this.vars.feedbackTooManyBonds = false;

					APPLICATION.updateFeedback();

					// Update path
					gsap.set(this.vars.trail, {
						attr:{
							d:'M 0 0'
						}
					});

					this.vars.dragging = false;
					atom.dragging = false;
					for(var i = 0; i < atom.bondDraggables.length; i++) {
						var drag = atom.bondDraggables[i];
						atom.dragging = atom.dragging || drag.vars.dragging;
					}
					APPLICATION.updateAtomsDragging();

					atom.follow();
				}, 
				//bounds:APPLICATION.bounds // Disabled because they were being inaccurately applied once part of a molecule
			}).pop();
			bondDraggable.disable();

			this.bondDraggables.push(bondDraggable);

			//console.log(bondDraggable);

		}

		this.follow();
	}

	this.checkBondErrors = function(otherAtom) {
		var tooFar = false;
		var noFreeElectrons = false;
		var noFreeElectronsH = false;
		var noFreeElectronsN = false;
		var noFreeElectronsO = false;
		var noFreeElectronsF = false;
		var noFreeElectronsCl = false;
		var noFreeElectronsBr = false;
		var tooManyBonds = false;

		// ...
		// Check for available free electrons
		if(otherAtom.numFreeElectrons < 1) {
			noFreeElectrons = true;

			if(otherAtom.symbol == 'H') noFreeElectronsH = true;
			else if(otherAtom.symbol == 'N') noFreeElectronsN = true;
			else if(otherAtom.symbol == 'O') noFreeElectronsO = true;
			else if(otherAtom.symbol == 'F') noFreeElectronsF = true;
			else if(otherAtom.symbol == 'Cl') noFreeElectronsCl = true;
			else if(otherAtom.symbol == 'Br') noFreeElectronsBr = true;
		}

		// Check for distance
		var ax = this.getAbsPosX();
		var ay = this.getAbsPosY();
		var bx = otherAtom.getAbsPosX();
		var by = otherAtom.getAbsPosY();

		if(UTIL.getDist(ax, bx, ay, by) > APPLICATION.gridSpacing * 1.5) {
			//console.log(UTIL.getDist(this.posX, otherAtom.posX, this.posY, otherAtom.posY));
			tooFar = true;
		}
		
		// Check for too many bonds with Carbon atoms
		// Check to see if these atoms are both Carbons
		if(this.symbol == 'C' && otherAtom.symbol == 'C') {
			// See if these already belong to a molecule
			if(this.parentMolecule != null) {
				// Locate shared bond, if it exists
				for(var i = 0; i < this.parentMolecule.bonds.length; i++) {
					var bond = this.parentMolecule.bonds[i];
					if(bond.atoms.indexOf(this) != -1 && bond.atoms.indexOf(otherAtom) != -1) {

						// See if there will be too many bonds
						if(bond.count >= 3) {
							tooManyBonds = true;
						}
						break;
					}
				}
			}
		}

		APPLICATION.updateFeedback();

		return {
			tooFar: tooFar, 
			noFreeElectrons: noFreeElectrons, 
			noFreeElectronsH: noFreeElectronsH, 
			noFreeElectronsN: noFreeElectronsN, 
			noFreeElectronsO: noFreeElectronsO, 
			noFreeElectronsF: noFreeElectronsF, 
			noFreeElectronsCl: noFreeElectronsCl, 
			noFreeElectronsBr: noFreeElectronsBr, 
			tooManyBonds: tooManyBonds
		}
	}

	this.getBondErrors = function() {
		var tooFar = false;
		var noFreeElectrons = false;
		var noFreeElectronsH = false;
		var noFreeElectronsN = false;
		var noFreeElectronsO = false;
		var noFreeElectronsF = false;
		var noFreeElectronsCl = false;
		var noFreeElectronsBr = false;
		var tooManyBonds = false;

		// Look through bond draggables to see if there are any feedback errors
		for(var i = 0; i < this.bondDraggables.length; i++) {
			var bondDraggable = this.bondDraggables[i];

			// Only check if the draggable is enabled
			if(bondDraggable.enabled()) {

				// Compare against feedback for this draggable
				tooFar = tooFar || bondDraggable.vars.feedbackTooFar;
				noFreeElectrons = noFreeElectrons || bondDraggable.vars.feedbackNoFreeElectrons;
				noFreeElectronsH = noFreeElectronsH || bondDraggable.vars.feedbackNoFreeElectronsH;
				noFreeElectronsN = noFreeElectronsN || bondDraggable.vars.feedbackNoFreeElectronsN;
				noFreeElectronsO = noFreeElectronsO || bondDraggable.vars.feedbackNoFreeElectronsO;
				noFreeElectronsF = noFreeElectronsF || bondDraggable.vars.feedbackNoFreeElectronsF;
				noFreeElectronsCl = noFreeElectronsCl || bondDraggable.vars.feedbackNoFreeElectronsCl;
				noFreeElectronsBr = noFreeElectronsBr || bondDraggable.vars.feedbackNoFreeElectronsBr;
				tooManyBonds = tooManyBonds || bondDraggable.vars.feedbackTooManyBonds;
			}
		}

		return {
			tooFar: tooFar, 
			noFreeElectrons: noFreeElectrons, 
			noFreeElectronsH: noFreeElectronsH, 
			noFreeElectronsN: noFreeElectronsN, 
			noFreeElectronsO: noFreeElectronsO, 
			noFreeElectronsF: noFreeElectronsF, 
			noFreeElectronsCl: noFreeElectronsCl, 
			noFreeElectronsBr: noFreeElectronsBr, 
			tooManyBonds: tooManyBonds
		}
	}


	// Update x/y positions of children to follow main element
	this.follow = function() {
		var children = [];
		children = children.concat(this.bondDragElems, this.bondTrailElems);

		gsap.set(children, {
			x:this.getPosX(), 
			y:this.getPosY()
		});
	}

	this.getPosX = function() {
		return gsap.getProperty(this.elem, 'x');
	}

	this.getPosY = function() {
		return gsap.getProperty(this.elem, 'y');
	}

	this.getAbsPosX = function() {
		if(this.parentMolecule != null) {
			return gsap.getProperty(this.parentMolecule.elem, 'x') + gsap.getProperty(this.elem, 'x');
		}
		return gsap.getProperty(this.elem, 'x');
	}

	this.getAbsPosY = function() {
		if(this.parentMolecule != null) {
			return gsap.getProperty(this.parentMolecule.elem, 'y') + gsap.getProperty(this.elem, 'y');
		}
		return gsap.getProperty(this.elem, 'y');
	}

	this.reappendBondDragElems = function() {
		for(var i = 0; i < this.bondDragElems.length; i++) {
			var dragElem = this.bondDragElems[i];
			var dragTrail = this.bondTrailElems[i];
			this.elem.parentNode.appendChild(dragElem);
			this.elem.parentNode.appendChild(dragTrail);
		}
	}

	this.toggleBonding = function(isBonding) {
		if(isBonding) {
			this.draggable.disable();

			if(this.parentMolecule != null) {
				this.parentMolecule.draggable.disable();
			}

			this.enableBondDraggables(true);

			// Shrink hit area for atom dragging
			gsap.set(this.dragHitAreaCircle, {
				scale:0
			});
		}
		else {
			if(this.parentMolecule == null) {
				this.draggable.enable();	
			}
			else {
				this.parentMolecule.draggable.enable();
			}

			this.enableBondDraggables(false);

			// Enlarge hit area for atom dragging
			gsap.set(this.dragHitAreaCircle, {
				scale:1
			});
		}
	}

	this.enableBondDraggables = function(isBonding) {
		if(isBonding) {
			if(!this.bondingEnabled) {
				for(var i = this.numFreeElectrons - 1; i >= 0; i--) {
					var drag = this.bondDraggables[i];
					var dragElem = drag.target;
					drag.enable();
					DOMHELPER.removeClass(dragElem, 'no-select');
					gsap.set(dragElem, {
						autoAlpha:1
					});
				}

				if(this.parentMolecule != null) {
					for(var i = 0; i < this.parentMolecule.bonds.length; i++) {
						var bond = this.parentMolecule.bonds[i];
						bond.bondBreakDrag.enable();
					}
				}

				this.bondingEnabled = true;
			}
		}
		else {
			if(this.bondingEnabled) {
				for(var i = 0; i < this.bondDraggables.length; i++) {
					var drag = this.bondDraggables[i];
					var dragElem = drag.target;
					drag.disable();
					DOMHELPER.addClass(dragElem, 'no-select');
					gsap.set(dragElem, {
						autoAlpha:0
					});
				}

				if(this.parentMolecule != null) {
					for(var i = 0; i < this.parentMolecule.bonds.length; i++) {
						var bond = this.parentMolecule.bonds[i];
						bond.bondBreakDrag.disable();
					}
				}

				this.bondingEnabled = false;
			}
		}
	}

	this.makeBond = function(otherAtom) {
		console.log('bond:');
		console.log(this);
		console.log(otherAtom);

		// Reduce free electron counts
		this.numFreeElectrons--;
		otherAtom.numFreeElectrons--;

		// Find closest free electrons and mark as bound
		var aAngle = UTIL.getDegreeAngle(this.getAbsPosX(), otherAtom.getAbsPosX(), this.getAbsPosY(), otherAtom.getAbsPosY());
		var bAngle = UTIL.mod(aAngle + 180, 360);

		console.log('target angles: ' + aAngle + ' ' + bAngle);

		var aNearestElectron = null;
		for(var i = 0; i < this.electrons.length; i++) {
			var e = this.electrons[i];
			if(!e.bound && e.type != 'lone') {
				if(aNearestElectron == null) aNearestElectron = e;
				else if(UTIL.getDegreeDist(aAngle, e.angle) < UTIL.getDegreeDist(aNearestElectron.angle, aAngle)) {
					aNearestElectron = e;
				}
			}
		}

		if(aNearestElectron != null) {
			console.log(aNearestElectron);
			console.log(aNearestElectron.angle + ' --> ' + aAngle);
			aNearestElectron.angle = UTIL.mod(aAngle, 360);
			aNearestElectron.bound = true;
		}

		var bNearestElectron = null;
		for(var i = 0; i < otherAtom.electrons.length; i++) {
			var e = otherAtom.electrons[i];
			if(!e.bound && e.type != 'lone') {
				if(bNearestElectron == null) bNearestElectron = e;
				else if(UTIL.getDegreeDist(bAngle, e.angle) < UTIL.getDegreeDist(bNearestElectron.angle, bAngle)) {
					bNearestElectron = e;
				}
			}
		}

		if(bNearestElectron != null) {
			console.log(bNearestElectron);
			console.log(bNearestElectron.angle + ' --> ' + bAngle);
			bNearestElectron.angle = UTIL.mod(bAngle, 360);
			bNearestElectron.bound = true;
		}

		/*gsap.set([aNearestElectron.elem, bNearestElectron.elem], {
			stroke:'#cc0000', 
			strokeWidth:4
		});*/

		// Disable a draggable for this atom
		for(var i = 0; i < this.bondDraggables.length; i++) {
			var draggable = this.bondDraggables[i];
			var dragElem = draggable.target;
			var dragTarget = draggable.targetAtom;
			if(draggable.enabled()) {
				draggable.disable();
				DOMHELPER.addClass(dragElem, 'no-select');
				gsap.set(dragElem, {
					autoAlpha:0
				});
				break;
			}
		}

		// Disable a draggable for the other atom
		for(var i = 0; i < otherAtom.bondDraggables.length; i++) {
			var draggable = otherAtom.bondDraggables[i];
			var dragElem = draggable.target;
			if(draggable.enabled()) {
				draggable.disable();
				DOMHELPER.addClass(dragElem, 'no-select');
				gsap.set(dragElem, {
					autoAlpha:0
				});
				break;
			}
		}

		// Visual changes
		// Highlight outines
		gsap.to([this.backgroundCircle, otherAtom.backgroundCircle], {
			duration:0.5, 
			strokeOpacity:1, 
			strokeWidth:1.5
		});


		// See if these atoms already share a bond
		//if(this.parentMolecule && otherAtom.parentMolecule && this.parentMolecule === otherAtom.parentMolecule && this.connectedAtoms.indexOf(otherAtom) != -1 && otherAtom.connectedAtoms.indexOf(this) != -1) {
		if(this.connectedAtoms.indexOf(otherAtom) != -1 && otherAtom.connectedAtoms.indexOf(this) != -1) {
			// Locate shared bond
			for(var i = 0; i < this.parentMolecule.bonds.length; i++) {
				var bond = this.parentMolecule.bonds[i];
				if(bond.atoms.indexOf(this) != -1 && bond.atoms.indexOf(otherAtom) != -1) {
					bond.addBond([aNearestElectron, bNearestElectron]);
					this.parentMolecule.elem.appendChild(bond.elem); // reappend bond element
					break;
				}
			}
		}
		else {
			// If either atom has a parent molecule, dispose of it first and collect their atoms, bonds
			var atoms = [];
			var bonds = [];

			if(this.parentMolecule != null) {
				atoms = atoms.concat(this.parentMolecule.atoms);
				bonds = bonds.concat(this.parentMolecule.bonds);

				for(var i = 0; i < this.parentMolecule.bonds.length; i++) {
					var bond = this.parentMolecule.bonds[i];
					bond.parentOffsetX = this.parentMolecule.posX;
					bond.parentOffsetY = this.parentMolecule.posY;
				}

				this.parentMolecule.dispose();
			}
			else if(atoms.indexOf(this) == -1) {
				atoms.push(this);
			}

			if(otherAtom.parentMolecule != null) {
				atoms = atoms.concat(otherAtom.parentMolecule.atoms);
				bonds = bonds.concat(otherAtom.parentMolecule.bonds);

				for(var i = 0; i < otherAtom.parentMolecule.bonds.length; i++) {
					var bond = otherAtom.parentMolecule.bonds[i];
					bond.parentOffsetX = otherAtom.parentMolecule.posX;
					bond.parentOffsetY = otherAtom.parentMolecule.posY;
				}

				otherAtom.parentMolecule.dispose();
			}
			else if(atoms.indexOf(otherAtom) == -1) {
				atoms.push(otherAtom);
			}

			// Add atoms to a new molecule
			var molecule = new Molecule();
			molecule.create(atoms);
			
			APPLICATION.molecules.push(molecule);
			var bond = new Bond();
			bond.make([this, otherAtom], [aNearestElectron, bNearestElectron], molecule);

			// Re-add old bonds
			for(var i = 0; i < bonds.length; i++) {
				var bond = bonds[i];
				bond.update();

				// Skip any bonds that were updated
				//if(existingBond === bond) continue;
				console.log('re-add old bond');

				bond.parentMolecule = molecule;
				molecule.elem.appendChild(bond.elem); // reappend bond element

				// Update position of bonds based on offset between old and new parent molecules
				gsap.set(bond.elem, {
					//x:'+=' + bond.parentOffsetX, 
					//y:'+=' + bond.parentOffsetY
					//x:bond.parentOffsetX, 
					//y:bond.parentOffsetY
				});

				molecule.bonds.push(bond);
			}

			// Add references to atoms between each other
			if(this.connectedAtoms.indexOf(otherAtom) == -1) {
				this.connectedAtoms.push(otherAtom);
			}

			if(otherAtom.connectedAtoms.indexOf(this) == -1) {
				otherAtom.connectedAtoms.push(this);
			}
		}

		// Update electron positions
		this.balanceElectrons();
		otherAtom.balanceElectrons();

		// Animate electron positions
		this.moveElectrons();
		otherAtom.moveElectrons();

		if(aNearestElectron != null) {
			aNearestElectron.angle = UTIL.mod(aAngle, 360);
			gsap.to(aNearestElectron.elem, {
				duration:0.45, 
				opacity:0, 
				ease:'power2.out'
			});
		}

		if(bNearestElectron != null) {
			bNearestElectron.angle = UTIL.mod(bAngle, 360);
			gsap.to(bNearestElectron.elem, {
				duration:0.45, 
				opacity:0, 
				ease:'power2.in'
			});
		}

		// Bandaid fix for some draggable enabled/disabled issues during bonding
		this.enableBondDraggables(false);
		this.enableBondDraggables(true);
		otherAtom.enableBondDraggables(false);
		otherAtom.enableBondDraggables(true);

		console.log(APPLICATION.moleculeIds.join(', '));
		
	}

	this.getConnectedAtoms = function() {
		var connectedAtoms = new AtomTree(this, null);
		connectedAtoms.buildTree();

		return connectedAtoms.getArray();
	}

	this.balanceElectrons = function() {
		console.log('balanceElectrons for ' + this.symbol);

		// Gather info
		var bondAngles = [];
		var unboundElectrons = [];
		//var remaining = this.numFreeElectrons;



		for(var i = 0; i < this.electrons.length; i++) {
			var e = this.electrons[i];
			if(e.bound) bondAngles.push(e.angle);
			else unboundElectrons.push(e);
		}

		var remaining = unboundElectrons.length;

		// Remove bond angle duplicates (double, triple bonds)
		var bondAnglesUnique = bondAngles.filter(function(item, index){
			return bondAngles.indexOf(item) >= index;
		});

		// Sort bond angles by angle, ascending
		bondAnglesUnique.sort(function (a, b) {
			return a - b;
		});

		//console.log(bondAnglesUnique);

		// If no bound electrons, position all electron angles starting at top and moving clockwise
		if(bondAnglesUnique.length == 0) {
			for(var i = 0, j = 0; i < unboundElectrons.length; i++, j += (12 / unboundElectrons.length)) {
				var e = unboundElectrons[i];
				e.setClockAngle(j);
			}
		}
		// Otherwise determine unbound electron angles based on remaining space
		else {
			// Determine regions for electrons
			var regions = [];

			// ...
			// compare number of bond regions with number of unbound electrons
			// ...

			// Only 1 bond
			if(bondAnglesUnique.length == 1) {
				regions.push({
					min:bondAnglesUnique[0], 
					max:bondAnglesUnique[0] + 360, 
					size:360, 
					num:unboundElectrons.length
				});

				remaining = 0;
			}
			else {
				for(var i = 0; i < bondAnglesUnique.length; i++) {
					var angle = bondAnglesUnique[i];
					//var nextAngle = bondAnglesUnique[UTIL.mod(i + 1, bondAnglesUnique.length)];
					var nextAngle = bondAnglesUnique[(i + 1) % bondAnglesUnique.length]; // can wrap around end of array
					var direction = 'cc'; // currently unused
					//if(nextAngle == 0 && angle > 0) nextAngle = 360;
					if(nextAngle < angle) {
						nextAngle += 360;
						//direction = 'ccw';
					}

					regions.push({
						min:UTIL.mod(angle, 360), 
						max:UTIL.mod(nextAngle, 360), 
						//size:Math.min(Math.abs(nextAngle - angle), Math.abs(nextAngle - angle - 360)), 
						direction:direction, 
						size:Math.abs(nextAngle - angle), 
						num:0
					});
				}

				// Sort regions by size, descending
				regions.sort(function (a, b) {
					return b.size - a.size;
				});

				// Determine number of electrons per region
				for(var i = 0; i < regions.length, remaining > 0; i++) {
					var region = regions[i];

					// If no next region, assign remaining electron count here
					if(i == regions.length - 1) {
						region.num = remaining;
						remaining = 0;
					}
					else {
						var nextRegion = regions[i + 1];

						// If next region size is same as this one, ensure their directions are the same
						if(region.size == nextRegion.size) nextRegion.direction = region.direction;

						// Compare region sizes
						// Determine proportion between regions
						var prop = Math.floor(region.size / nextRegion.size);
						if(prop == 0) prop = 1;

						//console.log('prop: ' + prop);
						//console.log('remaining: ' + remaining);

						// Greater than 3 times - put all electrons here
						if(prop >= 3) {
							region.num = remaining;
							remaining = 0;
						}
						else if(prop >= 2) {
							region.num = Math.min(2, remaining);
							remaining -= region.num;
						}
						else {
							region.num = Math.min(1, remaining);
							remaining -= region.num;
						}

						//console.log('remaining: ' + remaining);
					}
				}

				// Sort regions by num electrons, descending
				regions.sort(function (a, b) {
					return b.num - a.num;
				});
			}

			//console.log(regions);

			// Generate new angles based on regions
			var newAngles = [];
			
			for(var i = 0; i < regions.length; i++) {
				var region = regions[i];

				for(var j = 1; j <= region.num; j++) {
					//var min = Math.min(region.min, region.max);
					//var max = Math.max(region.min, region.max);
					//var direction = region.min > region.max ? -1 : 1;
					var direction = region.direction == 'ccw' ? -1 : 1;
					newAngles.push(UTIL.mod(region.min + direction * (j * region.size / (region.num + 1)), 360));
				}
			}

			//console.log(newAngles);

			// Assign unbound electron angles to nearest new angles
			for(var i = 0; i < unboundElectrons.length; i++) {
				var e = unboundElectrons[i];

				var nearest = newAngles[0];
				var nearestPos = 0;

				var j = 0;
				for(j = 1; j < newAngles.length; j++) {
					var a = newAngles[j];
					if(UTIL.getDegreeDist(e.angle, a) < UTIL.getDegreeDist(e.angle, nearest)) {
						nearest = a;
						nearestPos = j;
					}
				}

				//console.log('closest: ' + e.angle + ' --> ' + nearest);
				e.angle = UTIL.mod(nearest, 360);
				//console.log(nearest);

				newAngles.splice(nearestPos, 1);
			}

			//console.log(newAngles);
		}
	}

	this.initElectrons = function() {
		this.balanceElectrons();

		for(var i = 0; i < this.electrons.length; i++) {
			var e = this.electrons[i];
			if(!e.bound) {
				gsap.set(e.elem, {
					rotation:e.angle
				});
			}
		}
	}

	this.moveElectrons = function() {
		for(var i = 0; i < this.electrons.length; i++) {
			var e = this.electrons[i];
			gsap.to(e.elem, {
				duration:0.45, 
				rotation:e.angle + '_short', 
				ease:'power1.out'
			});
			if(!e.bound) {
				gsap.to(e.elem, {
					duration:0.45, 
					opacity:1, 
					ease:'power2.out'
				});
			}
		}
	}

	this.dispose = function() {
		// Disable draggable
		this.draggable.disable();

		// Clean up
		this.backgroundCircle.remove();
		this.symbolElem.remove();
		this.elem.remove();
		this.draggable.kill();

		for(var i = 0; i < this.bondDraggables.length; i++) {
			this.bondDraggable = this.bondDraggables[i];
			this.bondDraggable.kill();
		}

		for(var i = 0; i < this.bondDragElems.length; i++) {
			let bondDragElem = this.bondDragElems[i];
			bondDragElem.remove();
		}

		for(var i = 0; i < this.bondTrailElems.length; i++) {
			let bondTrailElem = this.bondTrailElems[i];
			bondTrailElem.remove();
		}

		this.bondDragElems = [];
		this.bondTrailElems = [];
		this.bondDraggables = [];
	}

}


var AtomTree = function(atom, parentAtom) {
	this.atom = atom;

	this.parentAtom = parentAtom;
	this.parentAtomTree = null;

	this.parents = [];

	this.branches = [];

	this.buildTree = function() {
		this.branches = [];

		// Build descendents
		for(var i = 0; i < this.atom.connectedAtoms.length; i++) {
			var childAtom = this.atom.connectedAtoms[i];

			// Skip if this child atom matches this tree's ancestors
			var ancestors = [];
			var ancestorTrees;

			if(parentAtom != null) {
				ancestorTrees = this.getParents();
				for(var k = 0; k < ancestorTrees.length; k++) {
					ancestors.push(ancestorTrees[k].atom);
				}
			}

			if(ancestors.indexOf(childAtom) != -1)  continue;

			// Create tree for child atom
			var childAtomTree = new AtomTree(childAtom, this.atom);

			// Assign parent to this atom, then build complete list of ancestors
			childAtomTree.parentAtomTree = this;
			childAtomTree.parents = childAtomTree.getParents();
			childAtomTree.buildTree();

			// Add to list of branches
			this.branches.push(childAtomTree);
		}
	}

	this.getParents = function() {
		var parents = [];

		var parent = this.parentAtomTree;
		while(parent != null) {
			parents.push(parent);
			parent = parent.parentAtomTree;
		}

		return parents;
	}

	this.getArray = function() {

		var tree = [this.atom];

		for(var i = 0; i < this.branches.length; i++) {
			var branch = this.branches[i];
			var branchAtoms = branch.getArray();
			tree = tree.concat(branchAtoms);
		}

		// Make array unique
		var treeUnique = tree.filter(function(item, index){
			return tree.indexOf(item) >= index;
		});

		return treeUnique;
	}
}