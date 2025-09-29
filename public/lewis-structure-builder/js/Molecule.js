var Molecule = function() {
	
	this.id;

	this.atoms = [];
	this.bonds = [];

	this.type = 'molecule';

	this.elem;
	//this.rect;
	this.bounds;

	this.moving = false;
	this.dragging = false;
	this.draggable;

	this.posX = 0;
	this.posY = 0;

	this.create = function(atoms) {
		this.id = Math.random().toFixed(8);
		this.atoms = atoms;

		this.elem = DOMHELPER.create('g', {
			styles:{
				transformOrigin:'0 0'
			}, 
			classes:['molecule'], 
			parent:APPLICATION.elem
		});

		// Disable constituent atom draggables
		this.disableAtomDraggables();

		// Add atoms to elem, assign parent molecule, and update positions for and reappend bond draggable elements
		for(var i = 0; i < this.atoms.length; i++) {
			var atom = this.atoms[i];
			this.elem.appendChild(atom.elem);
			atom.parentMolecule = this;
			atom.follow();
			atom.reappendBondDragElems();
		}

		// Determine min/max X/Y positions for atoms
		var minX = APPLICATION.bounds.maxX;
		var maxX = APPLICATION.bounds.minX;
		var minY = APPLICATION.bounds.maxY;
		var maxY = APPLICATION.bounds.minY;

		for(var i = 0; i < atoms.length; i++) {
			var atom = atoms[i];
			var atomX = atom.posX;
			var atomY = atom.posY;
			if(atomX < minX) minX = atomX;
			if(atomX > maxX) maxX = atomX;
			if(atomY < minY) minY = atomY;
			if(atomY > maxY) maxY = atomY;
		}

		this.bounds = {
			minX: minX, 
			maxX: maxX, 
			minY: minY, 
			maxY: maxY
		}

		/*var bbox = this.elem.getBBox();
		var rect = DOMHELPER.create('rect', {
			styles:{
				fill:'hsla(0, 100%, 100%, 0.1)'
			}, 
			attributes:{
				x:bbox.x, 
				y:bbox.y, 
				width:bbox.width, 
				height:bbox.height
			}, 
			parent:this.elem
		});*/

		this.draggable = Draggable.create(this.elem, {
			type:'x,y', 
			//target:rect, 
			inertia:true, 
			molecule:this, 
			//callbackScope:this, 
			onPress:function(e) {
				this.dragging = true;
				APPLICATION.dragging = true;
			}, 
			onDrag:function(e) {
				this.dragging = true;
				this.moving = true;
				APPLICATION.dragging = true;
			}, 
			onDragEnd:function(e) {
				this.dragging = false;
				APPLICATION.updateAtomsDragging();
				//this.follow();
				var molecule = this.vars.molecule;
				for(var i = 0; i < molecule.atoms.length; i++) {
					molecule.atoms[i].follow();
				}
			}, 
			onThrowComplete:function(e) {
				this.moving = false;
				//this.follow();
				var molecule = this.vars.molecule;
				for(var i = 0; i < molecule.atoms.length; i++) {
					molecule.atoms[i].follow();
				}
			}, 
			snap:{
				points:function(point) {
					//console.log(point)
					var molecule = this.vars.molecule;
					var nearestX = parseInt(Math.round(point.x / APPLICATION.gridSpacing) * APPLICATION.gridSpacing);
					var nearestY = parseInt(Math.round(point.y / APPLICATION.gridSpacing) * APPLICATION.gridSpacing);

					// Additional bounds correction
					if(nearestX < (APPLICATION.bounds.minX - molecule.bounds.minX)) nearestX = APPLICATION.bounds.minX - molecule.bounds.minX;
					if(nearestX > (APPLICATION.bounds.maxX - molecule.bounds.maxX)) nearestX = APPLICATION.bounds.maxX - molecule.bounds.maxX;
					if(nearestY < (APPLICATION.bounds.minY - molecule.bounds.minY)) nearestY = APPLICATION.bounds.minY - molecule.bounds.minY;
					if(nearestY > (APPLICATION.bounds.maxY - molecule.bounds.maxY)) nearestY = APPLICATION.bounds.maxY - molecule.bounds.maxY;

					//console.log(nearestX + ', ' + nearestY);
					//console.log(APPLICATION.getTargetPositionsGeneric(molecule, {x:nearestX, y:nearestY}));

					// Look for nearest open position
					//var nearestOpenPosition = APPLICATION.getNearestOpenPosition(
					var nearestOpenPosition = APPLICATION.getNearestOpenPositionGeneric(
						molecule, 
						{ // target position
							x:nearestX, 
							y:nearestY
						}, 
						{ // start position
							x:this.startX, 
							y:this.startY
						}
					);

					molecule.posX = nearestOpenPosition.x;
					molecule.posY = nearestOpenPosition.y;

					/*var nearestOpenPosition = {
						x:nearestX, 
						y:nearestY
					}*/

					//console.log(nearestOpenPosition);

					return nearestOpenPosition;
				}
			}, 
			//bounds:APPLICATION.bounds, 
			bounds:{
				minX:APPLICATION.bounds.minX - this.bounds.minX, 
				maxX:APPLICATION.bounds.maxX - this.bounds.maxX, 
				minY:APPLICATION.bounds.minY - this.bounds.minY, 
				maxY:APPLICATION.bounds.maxY - this.bounds.maxY
			}, 
			edgeResistance:0.5, 
			overshootTolerance:0.5
		}).pop();
		this.draggable.disable();

	}

	this.getPosX = function() {
		return gsap.getProperty(this.elem, 'x');
	}

	this.getPosY = function() {
		return gsap.getProperty(this.elem, 'y');
	}

	this.disableAtomDraggables = function() {
		for(var i = 0; i < this.atoms.length; i++) {
			var atom = this.atoms[i];
			atom.draggable.disable();
		}
	}

	this.getAtomPositions = function() {
		var positions = [];

		for(var i = 0; i < this.atoms.length; i++) {
			var atom = this.atoms[i];

			var position = {
				x:atom.posX + this.posX, 
				y:atom.posY + this.posY
			};

			positions.push(position);
		}

		return positions;
	}

	this.toggleBonding = function(isBonding) {
		if(isBonding) {
			for(var i = 0; i < this.bonds.length; i++) {
				var bond = this.bonds[i];
				bond.bondBreakDrag.enable();
				gsap.set(bond.bondBreak, {
					scale:1
				});
			}
		}
		else {
			for(var i = 0; i < this.bonds.length; i++) {
				var bond = this.bonds[i];
				bond.bondBreakDrag.disable();
				gsap.set(bond.bondBreak, {
					scale:0
				});
			}
		}
	}

	this.dispose = function() {
		// Capture X/Y coordinates
		var x = this.posX;
		var y = this.posY;

		// Disable draggable
		this.draggable.disable();

		// Re-append atoms to SVG, update position offsets, remove parent molecule references
		for(var i = 0; i < this.atoms.length; i++) {
			var atom = this.atoms[i];
			APPLICATION.elem.appendChild(atom.elem);
			gsap.set(atom.elem, {
				x:'+=' + x, 
				y:'+=' + y
			});
			atom.posX = atom.getPosX();
			atom.posY = atom.getPosY();
			atom.parentMolecule = null;
			atom.follow();
			atom.reappendBondDragElems();
		}

		// Clean up
		this.atoms = [];
		this.elem.remove();
		this.draggable.kill();

		for(var i = 0; i < APPLICATION.molecules.length; i++) {
			let mol = APPLICATION.molecules[i];
			console.log('compare ' + this.id + ' ' + mol.id);
			if(mol === this) {
				console.log('SPLICE');
				APPLICATION.molecules.splice(i, 1);
			}
		}
	}

}