var Bond = function() {

	this.parentMolecule = null;
	this.parentOffsetX = 0;
	this.parentOffsetY = 0;
	this.atoms = []; // Only even, of length 2
	this.electronPairs = [];

	this.elem;
	this.lines = [];
	this.breakButton;
	this.breakButtonHitArea;

	this.lineSpacing = 4;

	this.hitAreaRadius = 15;

	this.bondBreakDrag;

	this.count = 0; // Number of bonds

	this.make = function(atoms, electrons, molecule) {
		this.atoms = atoms;

		var frag = document.createDocumentFragment();

		this.elem = DOMHELPER.create('g', {
			classes:['bond'], 
			parent:frag
		});

		// Add break button
		this.breakButton = DOMHELPER.create('g', {
			styles:{
				x:this.atoms[0].posX + (this.atoms[1].posX - this.atoms[0].posX) * 0.5, 
				y:this.atoms[0].posY + (this.atoms[1].posY - this.atoms[0].posY) * 0.5, 
				transformOrigin:'50% 50%'
			}, 
			classes:['bond-break'], 
			parent:frag
		});

		/*this.breakButtonHitArea = DOMHELPER.create('circle', {
			attributes:{
				cx:0, 
				cy:0, 
				r:15, 
				stroke:'none', 
				fill:'rgba(255, 255, 255, 0.1)'
			}, 
			parent:this.breakButton
		});*/

		this.breakButtonHitArea = DOMHELPER.create('path', {
			styles:{
				fill:'none', 
				//stroke:'rgba(255, 255, 255, 0.1)', 
				stroke:'transparent', 
				strokeWidth:this.hitAreaRadius * 2
			}, 
			attributes:{
				d:'M0 0 v 0.1', 
				'stroke-linecap':'round'
			}, 
			parent:this.breakButton
		});

		this.bondBreakDrag = Draggable.create(this.breakButtonHitArea, {
			type:'x,y', 
			onPress:function(e) {
				APPLICATION.dragging = true;
			}, 
			onRelease:function(e) {
				APPLICATION.updateAtomsDragging();
			}, 
			onDrag:function(e) {
				APPLICATION.dragging = true;
			}, 
			onDragEnd:function(e) {
				APPLICATION.updateAtomsDragging();
			}, 
			liveSnap:function(value) {
				return 0;	
			}
		})[0];

		// Make first bond line
		this.addBond(electrons);

		var self = this;
		this.breakButton.addEventListener('click', function(e) {
			self.removeBond();

			// Suppress further events
			e.preventDefault();
			e.stopPropagation();
		});

		this.setMolecule(molecule);
	}

	this.update = function() {
		// Atom centers
		var aPos = {
			x:this.atoms[0].posX, 
			y:this.atoms[0].posY
		}

		var bPos = {
			x:this.atoms[1].posX, 
			y:this.atoms[1].posY
		}

		// Determine vector & normalized vector
		var dx = bPos.x - aPos.x;
		var dy = bPos.y - aPos.y;
		var dist = UTIL.getDist(aPos.x, bPos.x, aPos.y, bPos.y);
		var smallDist = dist - (2 * this.atoms[0].backgroundRadius);
		var nx = dx / dist;
		var ny = dy / dist;

		// Determine perpendicular offset vector
		var px = -ny;
		var py = nx;

		// Determine line start/end distances from atom centers
		var lineStartProp = this.atoms[0].backgroundRadius / dist;
		var lineEndProp = (dist - this.atoms[0].backgroundRadius) / dist;

		var lineX1 = aPos.x + dx * lineStartProp;
		var lineY1 = aPos.y + dy * lineStartProp;
		var lineX2 = aPos.x + dx * lineEndProp;
		var lineY2 = aPos.y + dy * lineEndProp;

		// If previously an odd number of lines, start offset by half distance, otherwise full distance
		var startOffset = -((this.lines.length - 1) * 0.5) * this.lineSpacing;

		// Reposition old bond lines
		for(var i = 0; i < this.lines.length; i++) {
			var line = this.lines[i];
			
			gsap.set(line, {
				x:(startOffset * px) + (i * this.lineSpacing * px), 
				y:(startOffset * py) + (i * this.lineSpacing * py), 
				attr:{
					d:'M ' + lineX1 + ' ' + lineY1 + ' L ' + lineX2 + ' ' + lineY2
				}
			});
		}

		// Re-add and position break button
		this.elem.appendChild(this.breakButton);

		gsap.set(this.breakButton, {
			x:aPos.x + (bPos.x - aPos.x) * 0.5, 
			y:aPos.y + (bPos.y - aPos.y) * 0.5, 
		});

		var bondBreakDist = dist - (2 * this.atoms[0].backgroundRadius) - (2 * this.hitAreaRadius);
		var bondBreakDistProp = bondBreakDist / dist;

		var bondBreakX1 = -dx * bondBreakDistProp * 0.5;
		var bondBreakY1 = -dy * bondBreakDistProp * 0.5;
		var bondBreakX2 = dx * bondBreakDistProp * 0.5;
		var bondBreakY2 = dy * bondBreakDistProp * 0.5;

		if(bondBreakDist < 0) {
			gsap.set(this.breakButtonHitArea, {
				attr:{
					d:'M 0 0 v 0.1'
				}
			});
		}
		else {
			gsap.set(this.breakButtonHitArea, {
				attr:{
					d:'M ' + bondBreakX1 + ' ' + bondBreakY1 + ' L ' + bondBreakX2 + ' ' + bondBreakY2
				}
			});
		}
	}

	this.addBond = function(electrons) {
		if(this.atoms.length != 2) {
			console.log('ERROR: this bond doesn\'t have the required number of atoms: ' + this.atoms);
		}

		this.electronPairs.push(electrons);

		// Create new bond line
		var newLine = DOMHELPER.create('path', {
			attributes:{
				d:'M 0 0'
			}, 
			classes:['bond-line', 'no-select'], 
			parent:this.elem
		});

		this.lines.push(newLine);

		// Update positions
		this.update();

		this.count++;
	}

	this.removeBond = function() {
		if(this.count < 1) return;

		this.count--;

		var a = this.atoms[0];
		var b = this.atoms[1];

		// Increase free electron counts
		a.numFreeElectrons++;
		b.numFreeElectrons++;

		// Enable a draggable for each atom
		for(var i = a.bondDraggables.length - 1; i >= 0; i--) {
			var draggable = a.bondDraggables[i];
			var dragElem = draggable.target;
			if(!draggable.enabled()) {
				draggable.enable();
				DOMHELPER.removeClass(dragElem, 'no-select');
				gsap.set(dragElem, {
					autoAlpha:1
				});
				break;
			}
		}

		for(var i = b.bondDraggables.length - 1; i >= 0; i--) {
			var draggable = b.bondDraggables[i];
			var dragElem = draggable.target;
			if(!draggable.enabled()) {
				draggable.enable();
				DOMHELPER.removeClass(dragElem, 'no-select');
				gsap.set(dragElem, {
					autoAlpha:1
				});
				break;
			}
		}

		// Remove a bond line
		var removeLine = this.lines.pop();
		removeLine.remove();

		// Update electron pairs
		var electrons = this.electronPairs.pop();
		electrons[0].bound = false;
		electrons[1].bound = false;

		this.atoms[0].balanceElectrons();
		this.atoms[1].balanceElectrons();
		this.atoms[0].moveElectrons();
		this.atoms[1].moveElectrons();

		// Update positions
		this.update();

		if(this.count == 0) {
			this.breakBond();
		}
		else {
			// Local explosion effect
			EFFECTS.explode(
				a.posX + (b.posX - a.posX) * 0.5, // x
				a.posY + (b.posY - a.posY) * 0.5, // y
				this.elem // parent
			);
		}
	}

	this.breakBond = function() {
		console.log('break bond');
		var a = this.atoms[0];
		var b = this.atoms[1];
		// Visual changes
		// ...

		// Split molecule at bond, determine resulting piece(s)
		a.connectedAtoms.splice(a.connectedAtoms.indexOf(b), 1);
		b.connectedAtoms.splice(b.connectedAtoms.indexOf(a), 1);

		var groupA = a.getConnectedAtoms();
		var groupB = b.getConnectedAtoms();
		console.log(groupA);
		console.log(groupB);

		//console.log(this.parentMolecule.bonds);

		// Remove this bond from parent molecule's array
		for(var i = 0; i < this.parentMolecule.bonds.length; i++) {
			var bond = this.parentMolecule.bonds[i];
			if(bond === this) {
				this.parentMolecule.bonds.splice(i, 1);
				break;
			}
		}
		this.elem.remove();
		this.bondBreakDrag.kill();
		//console.log(this.parentMolecule.bonds);

		// See if an atom in group A is included in group B (making them still part of the same molecule, because there was a loop)
		if(groupB.indexOf(groupA[0]) != -1) {
			// Same molecule, no further action required
			console.log('molecule still intact');
			return;
		}

		// Molecule must be split in two

		// Split up remaining bonds into respective camps
		var bondsA = [];
		var bondsB = [];

		for(var i = 0; i < groupA.length; i++) {
			var atomA = groupA[i];
			for(var j = 0; j < this.parentMolecule.bonds.length; j++) {
				var bond = this.parentMolecule.bonds[j];
				if(bond.atoms.indexOf(atomA) != -1) {
					bondsA.push(bond);
				}
			}
		}
		var bondsAUnique = bondsA.filter(function(item, index){
			return bondsA.indexOf(item) >= index;
		});

		for(var i = 0; i < groupB.length; i++) {
			var atomB = groupB[i];
			for(var j = 0; j < this.parentMolecule.bonds.length; j++) {
				var bond = this.parentMolecule.bonds[j];
				if(bond.atoms.indexOf(atomB) != -1) {
					bondsB.push(bond);
				}
			}
		}
		var bondsBUnique = bondsB.filter(function(item, index){
			return bondsB.indexOf(item) >= index;
		});

		console.log(bondsAUnique);
		console.log(bondsBUnique);

		// Store all bond positions - IS THIS NECESSARY?
		for(var i = 0; i < this.parentMolecule.bonds.length; i++) {
			var bond = this.parentMolecule.bonds[i];
			bond.parentOffsetX = this.parentMolecule.posX;
			bond.parentOffsetY = this.parentMolecule.posY;
		}

		// Dispose of old Molecule, create new one(s)
		var ids = [];
		console.log(APPLICATION.moleculeIds.join(', '));
		this.parentMolecule.dispose();
		console.log(APPLICATION.moleculeIds.join(', '));
		//console.log(APPLICATION.molecules.length);

		if(groupA.length > 1) {
			var molecule = new Molecule();
			molecule.create(groupA);
			molecule.bonds = bondsAUnique;
			for(var i = 0; i < molecule.bonds.length; i++) {
				var bond = molecule.bonds[i];
				bond.parentMolecule = molecule;
				bond.update();
				molecule.elem.appendChild(bond.elem);
			}
			APPLICATION.molecules.push(molecule);
			console.log(molecule.id);
			console.log(APPLICATION.molecules.length);
		}
		else {
			// Unhighlight outine for single atoms
			gsap.to(a.backgroundCircle, {
				duration:0.5, 
				strokeOpacity:0.75, 
				strokeWidth:1
			});
		}

		if(groupB.length > 1) {
			var molecule = new Molecule();
			molecule.create(groupB);
			molecule.bonds = bondsBUnique;
			for(var i = 0; i < molecule.bonds.length; i++) {
				var bond = molecule.bonds[i];
				bond.parentMolecule = molecule;
				bond.update();
				molecule.elem.appendChild(bond.elem);
			}
			APPLICATION.molecules.push(molecule);
			console.log(molecule.id);
			console.log(APPLICATION.molecules.length);
		}
		else {
			// Unhighlight outine for single atoms
			gsap.to(b.backgroundCircle, {
				duration:0.5, 
				strokeOpacity:0.75, 
				strokeWidth:1
			});
			this.elem.remove();
		}

		// Global explosion effect
		EFFECTS.explode(
			a.posX + (b.posX - a.posX) * 0.5, // x
			a.posY + (b.posY - a.posY) * 0.5, // y
			APPLICATION.elem // parent
		);

		// Remove reference to parent molecule
		//this.parentMolecule = null;

		console.log(APPLICATION.molecules);
		console.log(APPLICATION.molecules.length);
	}

	this.setMolecule = function(molecule) {
		this.parentMolecule = molecule;
		if(molecule.bonds.indexOf(this) == -1) {
			molecule.bonds.push(this);
		}
		molecule.elem.appendChild(this.elem);
	}

}