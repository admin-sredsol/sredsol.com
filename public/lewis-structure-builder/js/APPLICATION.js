var APPLICATION = (function() {

	var APP_STATE_ABOUT = 'app state about';
	var appState;

	var width;
	var height;

	var gridWidth = 7;
	var gridHeight = 7;
	var gridSpacing = 76;

	var svgHeight = gridHeight * gridSpacing; // Updated with window height on init and resize
	var svgTopOffset = 0; // currently unused
	var ar = 1;
	var loadAr = 1;
	var svgScale = 1;

	// Soft boundaries in SVG space
	var svgMinX = -(gridWidth * gridSpacing) * 0.5;
	var svgMaxX = (gridWidth * gridSpacing) * 0.5;
	var svgMinY = -(gridHeight * gridSpacing) * 0.5;
	var svgMaxY = (gridHeight * gridSpacing) * 0.5;

	// Page elements
	var elem;

	var svg; // root SVG
	var svgBackgroundGrid;
	var svgShapshot;
	var targetGoal;
	var targetGoalName;
	var zoomControls;
	var zoomInButton;
	var zoomOutButton;
	var modeToggle;
	var modeToggleLabel;
	var modePositioningButton;
	var modeBondingButton;
	var checkButton;
	var resetButton;
	var resetOverlay;
	var resetPrompt;
	var resetYesButton;
	var resetNoButton;
	var nextButton;
	var menu;
	var menuScroll;
	var menuOpenButton;
	var menuCloseButton;
	var menuAbout;
	var menuOverlay;
	var menuReminder;
	var recentAttemptsButton;
	var recentAttemptsButtonTriangle;
	var recentAttemptsList;
	var recentAttemptsSnapshot;
	var recentAttemptDisplayOverlay;
	var recentAttemptDisplay;
	var recentAttemptCloseIcon;
	var recentAttemptDisplaySnapshot;
	var recentAttemptDisplayMessage;
	var moleculeCorrectDisplay;
	var moleculeCorrectDisplaySnapshot;
	var moleculeCorrectDisplayRepresentations;
	var moleculeCorrectDisplayLonePairsMessage;
	var representationDisplayOverlay;
	var representationDisplay;
	var representationDisplayImg;
	var representationCloseIcon;

	var recentAttemptsSnapshotTl = null;

	var feedbackDisplay;

	var feedbackTooFar = false;
	var feedbackNoFreeElectrons = false;
	var feedbackNoFreeElectronsH = false;
	var feedbackNoFreeElectronsN = false;
	var feedbackNoFreeElectronsO = false;
	var feedbackNoFreeElectronsF = false;
	var feedbackNoFreeElectronsCl = false;
	var feedbackNoFreeElectronsBr = false;
	var feedbackTooManyBonds = false;


	var feedbackTextTooFar = '<p>Atom too far away to bond</p>';
	var feedbackTextTooManyBonds = '<p>Carbon can\'t make a quadruple bond</p>';
	var feedbackTextNoFreeElectrons = '<p>No valence electrons available for bonding</p>';
	var feedbackTextNoFreeElectronsH = '<p>Hydrogen can only make single bonds</p>';
	var feedbackTextNoFreeElectronsO = '<p>Oxygen can\'t make three bonds</p>';
	var feedbackTextNoFreeElectronsN = '<p>Nitrogen can\'t make four bonds</p>';
	var feedbackTextNoFreeElectronsF = '<p>Fluorine can only make single bonds</p>';
	var feedbackTextNoFreeElectronsCl = '<p>Chlorine can only make single bonds</p>';
	var feedbackTextNoFreeElectronsBr = '<p>Bromine can only make single bonds</p>';

	var STATE_POSITIONING = 'state positioning';
	var STATE_BONDING = 'state bonding';
	var state = STATE_POSITIONING;

	var drawing = false; // Toggle for drawing - prevents concurrent calls
	var dragging = false;
	var navigating = false;
	var mouseDragging = false;

	var useTouch = false;
	var useTouchTimeoutId;

	var PI2 = 2 * Math.PI; // currently unused

	var currentGame = null;
	var gameListItems = [];
	var gameListIds = [];

	var molecules = [];
	var atoms = [];

	var recentMenuOpen = false;
	var recentAttempts = {}; // { gameId: [ { elem:DOMElement, messages:[] } ], [ ... ], [ ... ] }

	var aboutScreen;
	var aboutScreenOverlay;
	var aboutScreenCloseButton;

	var helpScreen;
	var helpScreenOverlay;
	var helpScreenCloseButton;

	var atomInfo = {
		'H':{
			numElectrons:1, 
			numLonePairs:0, 
			name:'Hydrogen'
		}, 
		'C':{
			numElectrons:4, 
			numLonePairs:0, 
			name:'Carbon'
		}, 
		'N':{
			numElectrons:5, 
			numLonePairs:1, 
			name:'Nitrogen'
		}, 
		'O':{
			numElectrons:6, 
			numLonePairs:2, 
			name:'Oxygen'
		}, 
		'F':{
			numElectrons:7, 
			numLonePairs:3, 
			name:'Fluorine'
		}, 
		'Cl':{
			numElectrons:7, 
			numLonePairs:3, 
			name:'Chlorine'
		}, 
		'Br':{
			numElectrons:7, 
			numLonePairs:3, 
			name:'Bromine'
		}
	}



	// Graph zoom/pan behaviors
	var defaultScale = 1;

	var defaultWidthPortrait = gridWidth * gridSpacing;
	var defaultHeightPortrait = gridHeight * gridSpacing;

	var defaultWidthLandscape = gridWidth * gridSpacing;
	var defaultHeightLandscape = gridHeight * gridSpacing;

	var defaultWidth = defaultWidthPortrait;
	var defaultHeight = defaultHeightPortrait;

	var defaultXStart = 0; // currently unused
	var defaultYStart = 0 // currently unused


	var scale = 1;
	var targetScale = 1;
	var initScale = 1;

	// Bounds and behaviors
	var falloffScalar = 0.6; // Found to approximate x = y for low numbers before flattening/decaying
	var throwEase = 'power2.out';
	var relaxEase = 'power1.out';

	var relaxDur = 0.5;

	// Scale bounds (recalculated on graph load)
	var defaultMinScaleSoft = 0.65;

	var minScaleSoft = defaultMinScaleSoft;
	var minScale = minScaleSoft * 0.5;
	var minScaleDiff = minScaleSoft - minScale;
	var minScaleDiff2 = minScaleDiff * minScaleDiff;

	var maxScaleSoft = 3.5;
	var maxScale = 4.2;
	var maxScaleDiff = maxScale - maxScaleSoft;
	var maxScaleFalloffRatio = falloffScalar / maxScaleDiff;

	var sDist = 0;
	var sDistStart = 0;

	var sScaleStart = 1;

	var sTransformPointX;
	var sTransformPointY;
	var sTransformPointXStart;
	var sTransformPointYStart;

	// Data-centric values for display
	var gridWindow = {
		scale: defaultScale, 			// actual scale
		targetScale: defaultScale, 		// target scale, dampened by boundaries
		x: defaultXStart, 				// actual viewbox x position
		y: defaultYStart, 				// actual viewbox y position
		targetX: 0, 					// target x, dampened by boundaries (only used in 1 place)
		targetY: 0, 					// target y, dampened by boundaries (only used in 1 place)
		centerX: 0, 
		centerY: 0, 
		transformX: 0, 					// calculated start/end
		transformY: 0, 					// calculated start/end
		widthStart: defaultWidth, 		// calculated on load and resize, used in conjunction with scale
		heightStart: defaultHeight, 	// calculated on load and resize, used in conjunction with scale
		width: defaultWidth, 			// actual viewbox width
		height: defaultHeight 			// actual viewbox height
	};
	//console.log('load');
	//console.log(gridWindow);

	// Velocity tracking thresholds
	var velocityXMin = 15;
	var velocityYMin = 15;
	var velocityScaleMin = 1;

	var zoomIncrements = 3;
	var curZoomLevel = null;

	var numZoomStops = 5;
	var targetZoomStop = null;
	var zoomStops = [];


	var recentTouchTimes = [];
	var recentTouches = {};
	var recentClickTimes = [];
	var recentClicks = {};
	var doubleTapMinDelayMs = 50;
	var doubleTapMaxDelayMs = 400;
	var doubleTapMaxDist = 20;


	function init() {

		width = document.body.getBoundingClientRect().width;
		height = document.body.getBoundingClientRect().height;
		document.body.height = height;

		ar = width / height;
		loadAr = ar;

		svgHeight = height;

		defaultScale = 1;
		defaultWidth = ar > 1 ? defaultWidthLandscape : defaultWidthPortrait;
		defaultHeight = ar > 1 ? defaultHeightLandscape : defaultHeightPortrait;
		defaultXStart = -defaultWidth * 0.5;
		defaultYStart = -defaultHeight * 0.5;

		initScale = ar > 1 ? height / defaultHeight : width / defaultWidth;

		gridWindow = {
			scale: defaultScale, 
			targetScale: defaultScale, 
			x: defaultXStart, 
			y: defaultYStart, 
			targetX: 0, 
			targetY: 0, 
			centerX: 0, 
			centerY: 0, 
			transformX: 0, 
			transformY: 0, 
			widthStart: defaultWidth, 
			heightStart: defaultHeight, 
			width: defaultWidth, 
			height: defaultHeight
		};

		//console.log('init');
		//console.log(gridWindow);

		elem = svg = document.getElementById('svg');
		svgSnapshot = document.getElementById('svg-snapshot');
		targetGoal = document.getElementById('target-goal');
		targetGoalName = document.getElementById('target-goal-name');
		zoomControls = document.getElementById('zoom-controls');
		zoomInButton = document.getElementById('zoom-in');
		zoomOutButton = document.getElementById('zoom-out');
		modeToggle = document.getElementById('mode-toggle');
		modeToggleLabel = document.getElementById('mode-toggle-label');
		modePositioningButton = document.getElementById('toggle-positioning');
		modeBondingButton = document.getElementById('toggle-bonding');
		checkButton = document.getElementById('check-work');
		resetButton = document.getElementById('reset');
		resetOverlay = document.getElementById('reset-overlay');
		resetPrompt = document.getElementById('reset-prompt');
		resetYesButton = document.getElementById('reset-yes');
		resetNoButton = document.getElementById('reset-no');
		nextButton = document.getElementById('next-button');
		menu = document.getElementById('menu');
		menuScroll = document.getElementById('menu-scroll');
		menuOverlay = document.getElementById('menu-overlay');
		menuOpenButton = document.getElementById('menu-open-icon');
		menuCloseButton = document.getElementById('menu-close-icon');
		menuAbout = document.getElementById('menu-about');
		menuHelp = document.getElementById('menu-help');
		menuReminder = document.querySelector('.menu-reminder');
		feedbackDisplay = document.getElementById('feedback-display');
		recentAttemptsButton = document.getElementById('recent-attempts-button');
		recentAttemptsButtonTriangle = document.getElementById('recent-attempts-button-triangle');
		recentAttemptsList = document.getElementById('recent-attempts-list');
		recentAttemptsSnapshot = document.getElementById('recent-attempts-snapshot');
		recentAttemptDisplayOverlay = document.getElementById('recent-attempt-display-overlay');
		recentAttemptDisplay = document.getElementById('recent-attempt-display');
		recentAttemptCloseIcon = document.getElementById('recent-attempt-close-icon');
		recentAttemptDisplaySnapshot = document.getElementById('recent-attempt-display-snapshot');
		recentAttemptDisplayMessage = document.getElementById('recent-attempt-display-message');
		moleculeCorrectDisplay = document.getElementById('molecule-correct-display');
		moleculeCorrectDisplaySnapshot = document.getElementById('molecule-correct-display-snapshot');
		moleculeCorrectDisplayRepresentations = document.getElementById('molecule-correct-display-representations');
		moleculeCorrectDisplayLonePairsMessage = document.getElementById('molecule-correct-display-lone-pairs-title');
		representationDisplayOverlay = document.getElementById('representation-display-overlay');
		representationDisplay = document.getElementById('representation-display');
		representationDisplayImg = document.getElementById('representation-display-img');
		representationCloseIcon = document.getElementById('representation-close-icon');
		aboutScreen = document.getElementById('about-screen');
		aboutScreenOverlay = document.getElementById('about-screen-overlay');
		aboutScreenCloseButton = document.getElementById('about-screen-close-icon');
		helpScreen = document.getElementById('help-screen');
		helpScreenOverlay = document.getElementById('help-screen-overlay');
		helpScreenCloseButton = document.getElementById('help-screen-close-icon');


		// Calculate zoom info
		zoomStops = Array(numZoomStops);

		var zoomStopDistributor = gsap.utils.distribute({
			base:minScaleSoft, 
			amount:maxScaleSoft - minScaleSoft, 
			ease:'sine.in'
		});

		for(var i = 0; i < numZoomStops; i++) {
			zoomStops[i] = zoomStopDistributor(i, null, zoomStops);
		}


		// Build grid background for positioning;
		var gridLineOffsetX = (gridSpacing * 0.5);
		for(var i = 0; i <= gridWidth + 1; i++) {
			var gridLineVertical = DOMHELPER.create('path', {
				attributes:{
					fill:'none', 
					stroke:'rgba(255, 255, 255, 0.4)', 
					'stroke-width':1, 
					d:
						'M ' + 
							((svgMinX - gridLineOffsetX) + (i * gridSpacing)) + ' ' + 
							(svgMinY - gridLineOffsetX) + 
						' v ' + 
							(svgMaxY - svgMinY + gridSpacing)
				}, 
				styles:{
					opacity:1
				}, 
				classes:['grid-line'], 
				parent:elem
			});
		}

		// Build grid background for positioning
		var gridLineOffsetY = (gridSpacing * 0.5);
		for(var i = 0; i <= gridHeight + 1; i++) {
			var gridLineHorizontal = DOMHELPER.create('path', {
				attributes:{
					fill:'none', 
					stroke:'rgba(255, 255, 255, 0.4)', 
					'stroke-width':1, 
					d:
						'M ' + 
							(svgMinY - gridLineOffsetY) + ' ' + 
							((svgMinY - gridLineOffsetY) + (i * gridSpacing)) + 
						' h ' + 
							(svgMaxX - svgMinX + gridSpacing)
				}, 
				styles:{
					opacity:1
				}, 
				classes:['grid-line'], 
				parent:elem
			});
		}

		//console.log(zoomStops);


		// Resize listener
		window.addEventListener('resize', function graph_resize(e) {
			resize();
		});

		// Ignore context menu listener
		window.oncontextmenu = function() {
			return false;
		}


		// Navigation listeners
		svg.addEventListener('touchstart', onTouchStart, false);
		svg.addEventListener('touchend', onTouchEnd, false);
		//svg.addEventListener('touchcancel', onTouchCancel, false);
		svg.addEventListener('touchmove', onTouchMove, false);
		svg.addEventListener('click', onSvgClick);

		svg.addEventListener('wheel', onWheel, false);

		svg.addEventListener('mousedown', onMouseDown);
		svg.addEventListener('mousemove', onMouseMove);
		svg.addEventListener('mouseup', onMouseUp);

		// Build menu
		var listFrag = document.createDocumentFragment();

		for(var i = 0; i < GameManifest.length; i++) {
			let gameObj = GameManifest[i];

			var gameItem = DOMHELPER.create('li', {
				parent:listFrag
			});

			// Game text
			gameItem.innerHTML = gameObj.formula + '<span>(' + gameObj.name + ')</span>';

			// Check mark
			var gameItemCheck = DOMHELPER.create('svg', {
				attributes:{
					'preserveAspectRatio':'xMidYMid meet', 
					'viewBox':'0 0 32 32'
				}
			});
			gameItem.prepend(gameItemCheck);

			var gameItemCheckPath = DOMHELPER.create('path', {
				attributes:{
					fill:'none', 
					stroke:'#4dff94', 
					'stroke-width':4, 
					'stroke-linecap':'round', 
					d:'M 10 20 l 6 6 l 12 -12'
				}, 
				parent:gameItemCheck
			});

			// Event listener
			gameItem.addEventListener('click', function(e) {
				loadGame(gameObj);
			});

			gameObj.item = gameItem;
			gameObj.completed = false;

			gameListItems.push(gameItem);
			gameListIds.push(gameObj.id);
		}

		menuScroll.querySelector('ul').appendChild(listFrag);


		// UI interactions
		modeToggle.addEventListener('click', toggleState);

		zoomInButton.addEventListener('click', zoomIn);
		zoomOutButton.addEventListener('click', zoomOut);

		checkButton.addEventListener('click', checkWork);

		resetButton.addEventListener('click', promptReset);
		resetYesButton.addEventListener('click', reset);
		resetNoButton.addEventListener('click', resetClose);
		resetOverlay.addEventListener('click', resetClose);

		menuOpenButton.addEventListener('click', menuOpen);
		menuCloseButton.addEventListener('click', menuClose);
		menuAbout.addEventListener('click', showAbout);
		menuHelp.addEventListener('click', showHelp);
		menuOverlay.addEventListener('click', menuClose);

		recentAttemptsButton.addEventListener('click', toggleRecentMenu);
		recentAttemptCloseIcon.addEventListener('click', hideRecentAttempt);

		representationDisplay.addEventListener('click', hideRepresentation);

		nextButton.addEventListener('click', nextGame);

		aboutScreenCloseButton.addEventListener('click', hideAbout);
		helpScreenCloseButton.addEventListener('click', hideHelp);

		// DEBUG - prevent drag on browsers
		elem.addEventListener('touchmove', bodyTouchMove, {
			capture: false, 
			passive: false
		});

		// Add atoms
		loadGame(GameManifest[0]);


		// Initial draw
		draw();

		// Initialize scale and view
		zoomToRect(
			svgMinX - gridSpacing * 1, 
			svgMinY - gridSpacing * 1, 
			(svgMaxX - svgMinX) + gridSpacing * 2, 
			(svgMaxY - svgMinY) + gridSpacing * 2, 
			0
		);
		zoomToRect(
			svgMinX - gridSpacing * 0.5, 
			svgMinY - gridSpacing * 0.5, 
			(svgMaxX - svgMinX) + gridSpacing, 
			(svgMaxY - svgMinY) + gridSpacing, 
			2
		);

		// Show reminder, then hide it
		var tl = gsap.timeline({
			onComplete:function() {
				// Remove reminder
				menuReminder.remove();
			}
		});

		tl.set(menuReminder, {
			scale:0.75, 
			transformOrigin:'0% 0%'
		});

		tl.to(menuReminder, {
			duration:0.75, 
			autoAlpha:1
		}, 1);

		tl.to(menuReminder, {
			duration:0.75, 
			scale:1, 
			ease:'back.out(1.2)'
		}, 1);

		tl.to(menuReminder, {
			duration:0.5, 
			autoAlpha:0, 
			scale:0.85
		}, '+=4');
	}


	function loadGame(gameObj) {
		// Clear previous game
		clearGame();

		// Close menu, if open
		menuClose();

		// Clear recent activity list
		recentAttemptsList.innerHTML = '';

		// Store reference to game object
		currentGame = gameObj;

		// Close recent activity list
		recentClose();

		// Update menu
		for(var i = 0; i < gameListItems.length; i++) {
			var listItem = gameListItems[i];
			DOMHELPER.removeClass(listItem, 'selected');
		}

		DOMHELPER.addClass(currentGame.item, 'selected');

		// Update title
		targetGoal.innerHTML = gameObj.formula;
		targetGoalName.innerHTML = gameObj.name;

		// Add recent activity, if available
		if(typeof recentAttempts[currentGame.id] != 'undefined') {
			for(var i = 0; i < recentAttempts[currentGame.id].length; i++) {
				let attempts = recentAttempts[currentGame.id];
				recentAttemptsList.appendChild(attempts[i].elem);

				let elem = attempts[i].elem;
				let messages = attempts[i].messages;

				attempts[i].elem.addEventListener('click', function(e) {
					showRecentAttempt({
						elem:elem, 
						messages:messages
					});
				});
			}

			gsap.set(recentAttemptsButton, {
				alpha:1
			});
		}
		else {
			gsap.set(recentAttemptsButton, {
				alpha:0.5
			});
		}

		// Re-enable activity, if necessary
		svg.addEventListener('touchstart', onTouchStart, false);
		svg.addEventListener('touchend', onTouchEnd, false);
		svg.addEventListener('touchmove', onTouchMove, false);
		svg.addEventListener('click', onSvgClick, false);
		
		svg.addEventListener('wheel', onWheel, false);

		svg.addEventListener('mousedown', onMouseDown);
		svg.addEventListener('mousemove', onMouseMove);
		svg.addEventListener('mouseup', onMouseUp);

		modeToggle.addEventListener('click', toggleState);

		zoomInButton.addEventListener('click', zoomIn);
		zoomOutButton.addEventListener('click', zoomOut);

		checkButton.addEventListener('click', checkWork);
		resetButton.addEventListener('click', promptReset);

		// Reset zoom
		zoomToRect(
			svgMinX - gridSpacing * 0.5, 
			svgMinY - gridSpacing * 0.5, 
			(svgMaxX - svgMinX) + gridSpacing, 
			(svgMaxY - svgMinY) + gridSpacing, 
			1.5
		);

		// Show controls if hidden
		gsap.to([
			modeToggle, 
			zoomControls, 
			checkButton, 
			resetButton
		], {
			duration:0.75, 
			autoAlpha:1
		});

		// Build atoms
		var atomPositions = [];
		var atomElems = [];

		var frag = document.createDocumentFragment();

		for(var i = 0; i < gameObj.atoms.length; i++) {
			// Collect info
			var symbol = gameObj.atoms[i];
			var info = atomInfo[symbol];
			var e = 1;
			var lp = 0;

			if(typeof info == 'object') {
				e = info.numElectrons;
				lp = info.numLonePairs;
			}

			// Generate starting position
			var pos = getRandomPos();
			var openSpot = false;
			while(!openSpot) {
				for(var j = 0; j < atomPositions.length; j++) {
					var otherPos = atomPositions[j];
					if(pos.x == otherPos.x && pos.y == otherPos.y) {
						pos = getRandomPos();
						break;
					}
				}

				openSpot = true;
				atomPositions.push(pos);
			}

			// Build atom
			var atom = new Atom(symbol, e, lp);
			atom.build();
			frag.appendChild(atom.elem);
			gsap.set(atom.elem, {
				x:pos.x, 
				y:pos.y, 
				autoAlpha:0
			});
			atom.posX = pos.x;
			atom.posY = pos.y;
			atom.initBonds();
			atoms.push(atom);
			atomElems.push(atom.elem);
		}

		// Add to SVG
		elem.appendChild(frag);

		// Animate in
		var tl = gsap.timeline();

		tl.to(atomElems, 0.6, {
			autoAlpha:1, 
			stagger:0.1
		});

	}


	function clearGame() {
		// Dispose of molecules
		for(var i = 0; i < molecules.length; i++) {
			var molecule = molecules[i];

			for(var j = 0; j < molecule.bonds.length; j++) {
				var bond = molecule.bonds[j];
				bond.elem.remove();
			}

			molecule.dispose();
		}

		molecules = [];

		// Dispose of atoms
		for(var i = 0; i < atoms.length; i++) {
			var atom = atoms[i];

			for(var j = 0; j < atom.electrons.length; j++) {
				var electron = atom.electrons[j];
				electron.elem.remove();
			}

			atom.dispose();
		}

		atoms = [];

		// Final cleanup
		var bondBreaks = document.querySelectorAll('.bond-break');
		for(var i = 0; i < bondBreaks.length; i++) {
			bondBreaks[i].remove();
		}

		var bonds = elem.querySelectorAll('.bond');
		for(var i = 0; i < bonds.length; i++) {
			bonds[i].remove();
		}

		setState(STATE_POSITIONING);

		// Reset background color
		gsap.to(elem, {
			duration:0.25, 
			backgroundColor:'#19b394'
		});

		gsap.to(document.getElementById('footer-overlay-lingrad').querySelectorAll('stop'), {
			duration:0.25, 
			'stop-color':'#19b394'
		});

		gsap.to('.grid-line', {
			duration:3, 
			autoAlpha:1
		});

		gsap.to(moleculeCorrectDisplay, {
			duration:0.5, 
			autoAlpha:0
		});

		gsap.to(nextButton, {
			duration:0.5, 
			autoAlpha:0
		});

		gsap.to(moleculeCorrectDisplayLonePairsMessage, {
			duration:0.25, 
			autoAlpha:0
		});
	}


	function nextGame() {
		// Ignore if no current game
		if(currentGame == null) return;

		var currentGamePos = gameListIds.indexOf(currentGame.id);

		// Ignore if no next game
		if(currentGamePos == -1 || currentGamePos >= gameListIds.length - 1) return;

		// Load next game
		var nextGameId = gameListIds[currentGamePos + 1];
		var nextGameObj = getGameById(nextGameId);
		if(nextGameObj == null) return;

		console.log(nextGameId);
		console.log(nextGameObj);

		loadGame(nextGameObj);
	}

	function getGameById(id) {
		for(var obj in GameManifest) {
			if(GameManifest[obj].id == id) return GameManifest[obj];
		}
		return null;
	}


	function getRandomPos() {
		var offset = (gridWidth % 2) * (gridSpacing * 0.5);
		var x = svgMinX + (Math.random() * (svgMaxX - svgMinX));
		x = parseInt(Math.round(x / gridSpacing) * gridSpacing) - offset;
		var y = svgMinY + (Math.random() * (svgMaxY - svgMinY));
		y = parseInt(Math.round(y / gridSpacing) * gridSpacing) - offset;

		return {
			x:x, 
			y:y
		}
	}


	function checkWork() {
		console.log('check work');

		var messages = [];

		// If no game object is present, error out
		if(currentGame == null) {
			console.log('no target molecule');
			messages.push('Try selecting a target molecule to build');
			return;
		}

		// Build objects to help in determining matches
		var correctMolecules = [];
		var moleculeFeedback = {};

		// Atom symbol counts (target & current)
		var targetAtomSymbols = [];
		var targetAtoms = {};

		for(var i = 0; i < currentGame.atoms.length; i++) {
			var targetAtom = currentGame.atoms[i];

			if(typeof targetAtoms[targetAtom] == 'undefined') {
				targetAtoms[targetAtom] = 0;
				targetAtomSymbols.push(targetAtom);
			}
			targetAtoms[targetAtom]++;
		}

		// If there aren't any molecules, error out
		if(molecules.length == 0) {
			console.log('no molecules found');
			var message = 'It doesn\'t look like there are any molecules built yet';
			messages.push(message);

			feedbackToast(message);

			for(var i = 0; i < atoms.length; i++) {
				var atom = atoms[i];
				gsap.from(atom.elem.querySelectorAll('.atom-background'), 1.2, {
					fill:'#cc0000', 
					stroke:'#cc0000', 
					clearProps:'fill,stroke', 
					ease:'power1.in'
				});
			}
			return;
		}

		// Look through all molecules, gathering info
		for(var i = 0; i < molecules.length; i++) {
			var molecule = molecules[i];
			var numFreeElectrons = 0;
			var currentMessages = [];

			var currentSymbols = [];
			var currentAtoms = {};

			// Check to see if component atoms match
			for(var j = 0; j < molecule.atoms.length; j++) {
				var atom = molecule.atoms[j];

				// Count atoms by type
				if(typeof currentAtoms[atom.symbol] == 'undefined') {
					var target = targetAtoms[atom.symbol];
					currentAtoms[atom.symbol] = {
						target:typeof target != 'undefined' ? target : 0, 
						current:0
					};
					currentSymbols.push(atom.symbol);
				}
				currentAtoms[atom.symbol].current++;

				// Count free electrons
				numFreeElectrons += atom.numFreeElectrons;
			}

			// Keep track of any atom types completely missing from the molecule
			for(var j = 0; j < targetAtomSymbols.length; j++) {
				var targetAtomSymbol = targetAtomSymbols[j];
				if(typeof currentAtoms[targetAtomSymbol] == 'undefined') {
					currentAtoms[targetAtomSymbol] = {
						target:targetAtoms[targetAtomSymbol], 
						current:0
					};
					currentSymbols.push(targetAtomSymbol);
				}
			}

			// Compare counts and construct message (if applicable)
			var atomCountOver = [];
			var atomCountUnder = [];

			// Keep track of each symbol that's over or under count
			for(var j = 0; j < currentSymbols.length; j++) {
				var currentSymbol = currentSymbols[j];
				var currentAtomInfo = currentAtoms[currentSymbol];

				if(currentAtomInfo.current > currentAtomInfo.target) atomCountOver.push(atomInfo[currentSymbol].name);
				else if(currentAtomInfo.current < currentAtomInfo.target) atomCountUnder.push(atomInfo[currentSymbol].name);
			}

			// Add it to messages if appropriate
			if(atomCountOver.length > 0 || atomCountUnder.length > 0) {
				currentMessages.push('You\'re not using all of the available atoms in the formula');
			}

			// Free electrons
			if(numFreeElectrons > 0) {
				currentMessages.push('Remember to create as many bonds as you can between atoms, using all valence electrons');
			}

			// Check if correct
			if(atomCountOver.length == 0 && atomCountUnder.length == 0 && numFreeElectrons == 0) {
				correctMolecules.push(molecule);
			}

			moleculeFeedback[molecule] = {
				messages:currentMessages
			};
			console.log(currentMessages);

		}

		console.log(correctMolecules);

		// Evaluate based on game type
		if(currentGame.type == 'sequence') {
			// Found correct molecule
			if(correctMolecules.length > 0) {
				console.log('Awesome!');
				console.log(correctMolecules[0]);

				// Save attempt
				addRecentAttempt(molecules[0], ['Great work! This is a valid structure for ' + currentGame.formula], 'correct');

				currentGame.completed = true;
				DOMHELPER.addClass(currentGame.item, 'correct');

				showSolved(correctMolecules[0]);
			}
			// Single molecule w/feedback
			else if(molecules.length == 1) {
				console.log(moleculeFeedback[molecules[0]].messages);

				// Save attempt
				addRecentAttempt(molecules[0], moleculeFeedback[molecules[0]].messages, 'wrong');

				// Flash molecule as incorrect
				gsap.from(molecules[0].elem.querySelectorAll('.atom-background, .bond-line'), 1.2, {
					fill:'#cc0000', 
					stroke:'#cc0000', 
					clearProps:'fill,stroke', 
					ease:'power1.in'
				});
			}
			// Multiple incorrect molecules
			else {
				feedbackToast('Try combining or removing extra molecules');

				// Flash molecule as incorrect
				for(var i = 0; i < molecules.length; i++) {
					var molecule = molecules[i];
					gsap.from(molecule.elem.querySelectorAll('.atom-background, .bond-line'), 1.2, {
						fill:'#cc0000', 
						stroke:'#cc0000', 
						clearProps:'fill,stroke', 
						ease:'power1.in'
					});
				}
			}
		}

	}


	function showSolved(molecule) {
		// Determine whether lone pairs are present
		var hasLonePairs = false;

		for(var i = 0; i < molecule.atoms.length; i++) {
			var atom = molecule.atoms[i];
			if(atom.numLonePairs > 0) {
				hasLonePairs = true;
				break;
			}
		}

		// ...
		// Disable navigation and dragging
		svg.removeEventListener('touchstart', onTouchStart, false);
		svg.removeEventListener('touchend', onTouchEnd, false);
		svg.removeEventListener('touchmove', onTouchMove, false);
		svg.removeEventListener('click', onSvgClick, false);
		
		svg.removeEventListener('wheel', onWheel, false);

		svg.removeEventListener('mousedown', onMouseDown);
		svg.removeEventListener('mousemove', onMouseMove);
		svg.removeEventListener('mouseup', onMouseUp);

		for(var i = 0; i < molecules.length; i++) {
			var m = molecules[i];
			if(m.draggable.enabled()) m.draggable.disable();
		}

		// Disable other controls
		modeToggle.removeEventListener('click', toggleState);

		zoomInButton.removeEventListener('click', zoomIn);
		zoomOutButton.removeEventListener('click', zoomOut);

		checkButton.removeEventListener('click', checkWork);
		resetButton.removeEventListener('click', promptReset);

		// Additional check to see if molecule has lone pairs that need to be identified
		// ...
		console.log(molecule);

		//menuOpenButton.removeEventListener('click', menuOpen);
		//menuCloseButton.removeEventListener('click', menuClose);
		//menuOverlay.removeEventListener('click', menuClose);

		// Animate to completed state
		var tl = gsap.timeline();

		// Hide other molecules/atoms, controls

		// Molecules
		for(var i = 0; i < molecules.length; i++) {
			var m = molecules[i];
			tl.to(m.elem, 0.75, {
				autoAlpha:0
			}, 0);
		}

		// Atoms
		for(var i = 0; i < atoms.length; i++) {
			var a = atoms[i];
			if(a.parentMolecule == null) {
				tl.to(a.elem, 0.75, {
					autoAlpha:0
				}, 0);
			}
		}

		// Controls
		tl.to([
			modeToggle, 
			zoomControls, 
			checkButton, 
			resetButton, 
			//menuOpenButton, 
			//menuCloseButton, 
			//menuOverlay
		], {
			duration:0.75, 
			autoAlpha:0
		}, 0);

		// Ensure we're still showing the right molecule
		tl.to(molecule.elem, {
			duration:0.75, 
			autoAlpha:1
		}, 0);

		// Zoom in on molecule
		var minWidth = 300;
		var minHeight = 300;

		var startCenterX = gridWindow.centerX;
		var startCenterY = gridWindow.centerY;

		var bbox = molecule.elem.getBBox();
		var x = bbox.x + molecule.getPosX();
		var y = bbox.y + molecule.getPosY();
		var w = bbox.width;
		var h = bbox.height;

		var centerX = x + (w * 0.5);
		var centerY = y + (h * 0.5);

		if(w < minWidth) {
			w = minWidth;
			x = centerX - (w * 0.5);
		}

		if(h < minHeight) {
			h = minHeight;
			y = centerY - (h * 0.5);
		}

		// Zoom in to molecule
		tl.call(function(e) {
			// Zoom in and add some spacing around the molecule
			zoomToRect(
				x - gridSpacing * 0.5, 
				y - gridSpacing * 0.5, 
				w + gridSpacing * 1, 
				h + gridSpacing * 1, 
				3
			);
		}, null, null, 0);

		// Darken background
		tl.to(elem, {
			duration:3, 
			backgroundColor:'#0a3e43'
		}, 0);

		tl.to('.grid-line', {
			duration:3, 
			autoAlpha:0
		}, 0);

		// Hide atom backgrounds
		tl.to(molecule.elem.querySelectorAll('.atom-background'), 2, {
			autoAlpha:0
		}, 0);

		tl.to(document.getElementById('footer-overlay-lingrad').querySelectorAll('stop'), {
			duration:3, 
			'stop-color':'#0a3e43'
		}, 0);

		// Fireworks explosion if correct
		var explosionRadius = UTIL.getDist(bbox.x, (bbox.x + bbox.width * 0.5), bbox.y, (bbox.y + bbox.height * 0.5));

		var fireworkTl = EFFECTS.firework(
			centerX, 
			centerY, 
			elem, 
			{
				//minInitNum:12, 
				//maxInitNum:16, 
				//minInitSize:10, 
				//maxInitSize:14, 
				minInitDist:explosionRadius * 0.65, 
				maxInitDist:explosionRadius, 
				minInitTravelDur:0.4, 
				maxInitTravelDur:0.9, 
				minInitFadeDur:0.15, 
				maxInitFadeDur:0.3, 
				explosionDelay:0.25, 
				minSubNum:7, 
				maxSubNum:10, 
				minSubSize:4, 
				maxSubSize:6, 
				minSubStartDist:3, 
				maxSubStartDist:35, 
				minSubFallDist:8, 
				maxSubFallDist:12, 
				minSubFadeDur:0.15, 
				maxSubFadeDur:0.25, 
				minFlickerNum:2, 
				maxFlickerNum:3, 
				minFlickerDelay:0.1, 
				maxFlickerDelay:0.4
			}
		);

		if(!hasLonePairs) {
			tl.add(fireworkTl, 1);

			tl.addLabel('show-correct', 4);

			// Set correct info
			tl.call(function() {
				showCorrectMolecule(molecule, currentGame);
			}, null, 'show-correct');

			// Hide molecule in background
			tl.to(molecule.elem, {
				duration:0.3, 
				autoAlpha:0, 
				ease:'power1.out'
			}, 'show-correct');

			// Show correct info screen
			tl.to(moleculeCorrectDisplay, {
				duration:1, 
				autoAlpha:1
			}, 'show-correct+=0.25')

			// Show next button if there's a next game
			var currentGamePos = gameListIds.indexOf(currentGame.id);
			if(currentGamePos < gameListIds.length - 1) {
				tl.to(nextButton, {
					duration:1, 
					autoAlpha:1
				}, 'show-correct+=0.5');
			}
		}
		else {
			// Hold off on the fireworks
			fireworkTl.pause();

			// Show lone pairs message
			tl.to(moleculeCorrectDisplayLonePairsMessage, {
				duration:0.5, 
				autoAlpha:1
			}, 0);

			// Show lone pairs effect and add listeners
			for(var i = 0; i < molecule.atoms.length; i++) {
				let atom = molecule.atoms[i];
				for(var j = 0; j < atom.electrons.length; j++) {
					let electron = atom.electrons[j];
					if(electron.type == 'lone') {
						electron.loneHighlightTl.play();
						gsap.set(electron.loneHighlightHitArea, {
							display:'inherit'
						});

						// Clicking checks the lone pair
						electron.loneHighlightHitArea.addEventListener('click', function(e) {
							electron.loneChecked = true;

							// Hide highlight then pause timeline
							gsap.to(electron.loneHighlight, {
								duration:0.25, 
								autoAlpha:0, 
								onComplete:function(e) {
									electron.loneHighlightTl.pause();
								}
							});

							gsap.set(electron.loneHighlightHitArea, {
								display:'none'
							});

							// Highlight electrons
							gsap.to(electron.electrons, {
								duration:0.25, 
								fill:'#ffffff'
							});

							// See if all are checked
							var checked = checkLonePairs(molecule);
							if(checked) {
								gsap.to(moleculeCorrectDisplayLonePairsMessage, {
									duration:0.5, 
									autoAlpha:0
								});
								showCorrect(molecule, fireworkTl);
							}
						});
					}
				}
			}
		}
	}


	function checkLonePairs(molecule) {
		var lonePairsChecked = true;

		for(var i = 0; i < molecule.atoms.length; i++) {
			let atom = molecule.atoms[i];
			for(var j = 0; j < atom.electrons.length; j++) {
				let electron = atom.electrons[j];
				if(electron.type == 'lone') {
					lonePairsChecked = lonePairsChecked && electron.loneChecked;
				}
			}
		}

		return lonePairsChecked;
	}


	function showCorrect(molecule, fireworkTl) {
		// Animate to completed state
		var tl = gsap.timeline();

		// Show firework
		fireworkTl.play();

		tl.addLabel('show-correct', 3);

		// Set correct info
		tl.call(function() {
			showCorrectMolecule(molecule, currentGame);
		}, null, 'show-correct');

		// Hide molecule in background
		tl.to(molecule.elem, {
			duration:0.3, 
			autoAlpha:0, 
			ease:'power1.out'
		}, 'show-correct');

		// Show correct info screen
		tl.to(moleculeCorrectDisplay, {
			duration:1, 
			autoAlpha:1
		}, 'show-correct+=0.25')

		// Show next button if there's a next game
		var currentGamePos = gameListIds.indexOf(currentGame.id);
		if(currentGamePos < gameListIds.length - 1) {
			tl.to(nextButton, {
				duration:1, 
				autoAlpha:1
			}, 'show-correct+=0.5');
		}
	}


	function promptReset() {
		var tl = gsap.timeline({
			onStart:function() {
				DOMHELPER.clickable(resetOverlay);
			}
		});

		tl.to([resetOverlay, resetPrompt], 0.5, {
			autoAlpha:1
		}, 0);
	}

	function resetClose() {
		var tl = gsap.timeline({
			onStart:function() {
				DOMHELPER.unclickable(resetOverlay);
			}
		});

		tl.to([resetOverlay, resetPrompt], 0.5, {
			autoAlpha:0
		}, 0);
	}

	function reset() {
		resetClose();

		modeToggle.removeEventListener('click', toggleState);

		zoomInButton.removeEventListener('click', zoomIn);
		zoomOutButton.removeEventListener('click', zoomOut);

		checkButton.removeEventListener('click', checkWork);
		resetButton.removeEventListener('click', promptReset);

		// Dispose of molecules
		for(var i = 0; i < molecules.length; i++) {
			var molecule = molecules[i];
			molecule.dispose();
		}

		// Explode atoms
		var tl = gsap.timeline({
			onComplete:function(e) {
				// Load game again
				loadGame(currentGame);
			}
		});

		for(var i = 0; i < APPLICATION.atoms.length; i++) {
			var atom = APPLICATION.atoms[i];

			var explodeTl = EFFECTS.explode(atom.getAbsPosX(), atom.getAbsPosY(), APPLICATION.elem, {
				vibrate:true, 
				min:15, 
				max:30, 
				minSize:5, 
				maxSize:10, 
				minDist:30, 
				maxDist:50, 
				minDur:0.3, 
				maxDur:0.7
			});

			tl.add(explodeTl, i * 0.1);

			tl.to(atom.elem, 0.1, {
				autoAlpha:0
			}, i * 0.1);
		}

		//console.log(this);
		//console.log(APPLICATION);
		//console.log(APPLICATION.atoms);

		/*var atomPositions = [];

		for(var i = 0; i < APPLICATION.atoms.length; i++) {
			var atom = APPLICATION.atoms[i];

			var pos = getRandomPos();
			var openSpot = false;
			while(!openSpot) {
				for(var j = 0; j < atomPositions.length; j++) {
					var otherPos = atomPositions[j];
					if(pos.x == otherPos.x && pos.y == otherPos.y) {
						pos = getRandomPos();
						break;
					}
				}

				openSpot = true;
				atomPositions.push(pos);
			}

			// Build atom
			tl.to(atom.elem, UTIL.rand(0.4, 0.6), {
				x:pos.x, 
				y:pos.y, 
				ease:Power2.easeOut
			}, 0);
			atom.posX = pos.x;
			atom.posY = pos.y;
		}*/
	}


	function menuOpen() {
		resetClose();

		var tl = gsap.timeline({
			onStart:function() {
				DOMHELPER.clickable(menuOverlay);
			}
		});

		tl.to(menuOpenButton, { 
			duration:0.5, 
			autoAlpha:0
		}, 0);

		tl.to(menuOverlay, {
			duration:0.5, 
			autoAlpha:1
		}, 0);

		tl.to(menu, {
			duration:0.5, 
			x:'0%', 
			autoAlpha:1, 
			ease:'power2.out'
		}, 0);
	}

	function menuClose() {
		var tl = gsap.timeline({
			onStart:function() {
				DOMHELPER.unclickable(menuOverlay);
			}
		});

		tl.to(menu, {
			duration:0.5, 
			x:'-100%', 
			autoAlpha:0, 
			ease:'power2.out'
		}, 0);

		tl.to(menuOverlay, {
			duration:0.5, 
			autoAlpha:0
		}, 0);

		tl.to(menuOpenButton, { 
			duration:0.5, 
			autoAlpha:1
		}, '-=0.25');
	}

	function toggleRecentMenu() {
		if(recentMenuOpen) recentClose();
		else recentOpen();
	}

	function recentOpen() {
		if(typeof currentGame == 'undefined') return;
		if(typeof recentAttempts[currentGame.id] == 'undefined') return;
		if(recentAttempts.length == 0) return;

		recentMenuOpen = true;

		var tl = gsap.timeline({
			onStart:function() {
				gsap.set(recentAttemptsList, {
					display:'block', 
					'overflow-y':'hidden'
				});
				gsap.set(recentAttemptsSnapshot, {
					display:'none'
				});
				recentAttemptsList.scrollTop = 0;
			}, 
			onComplete:function() {
				gsap.set(recentAttemptsList, {
					'overflow-y':'auto'
				});
			}
		});

		// Change button state
		tl.set(recentAttemptsButtonTriangle, {
			rotation:180, 
			transformOrigin:'50% 50%'
		}, 0);

		// Reveal attempts
		var stagger = 0.03;
		for(var i = 0; i < recentAttempts[currentGame.id].length; i++) {
			var attempt = recentAttempts[currentGame.id][i];
			var attemptThumbnail = attempt.elem;
			tl.fromTo(attemptThumbnail, 0.25, {
				autoAlpha:0, 
				y:-15
			}, {
				autoAlpha:1, 
				y:0
			}, i * stagger);
		}
	}

	function recentClose() {
		recentMenuOpen = false;

		var tl = gsap.timeline({
			onComplete:function() {
				gsap.set(recentAttemptsList, {
					display:'none'
				});
				gsap.set(recentAttemptsSnapshot, {
					display:'block'
				});
			}
		});

		// Change button state
		tl.set(recentAttemptsButtonTriangle, {
			rotation:0, 
			transformOrigin:'50% 50%'
		}, 0);

		// Avoid modifying anything if no current game is specified or no attempts are present
		if(typeof currentGame == 'undefined') return;
		if(typeof recentAttempts[currentGame.id] == 'undefined') return;

		// Reveal attempts
		for(var i = 0; i < recentAttempts[currentGame.id].length; i++) {
			var attempt = recentAttempts[currentGame.id][i];
			var attemptThumbnail = attempt.elem;
			tl.to(attemptThumbnail, 0.15, {
				autoAlpha:0
			}, 0);
		}
	}

	function screenToSvg(screenX, screenY) {
		var svgPoint = {
			x:screenX, 
			y:screenY
		};
		
		//console.log(svgPoint);

		/*
		var scaleX = width / gridWindow.width;

		var svgScalar = svgScale / gridWindow.scale;
		var svgScalarX = scaleX * svgScalar;

		var viewBoxWidth = width * svgScalar;
		var viewBoxX = (gridWindow.centerX * svgScalarX) - viewBoxWidth * 0.5;
		*/

		var viewBoxWidth = width / gridWindow.scale;
		var viewBoxHeight = height / gridWindow.scale;
		var viewBoxX = (gridWindow.centerX * ((width / gridWindow.width) / gridWindow.scale)) - viewBoxWidth * 0.5;
		var viewBoxY = (gridWindow.centerY * ((height / gridWindow.height) / gridWindow.scale)) - viewBoxHeight * 0.5;

		var cbr = elem.getBoundingClientRect();
		var normX = screenX / cbr.width;
		var normY = screenY / cbr.height;

		//svgPoint.x = gridWindow.x + normX * (gridWindow.width) * 1;
		//svgPoint.y = gridWindow.y + normY * (gridWindow.height) * 1;
		svgPoint.x = viewBoxX + normX * viewBoxWidth;
		svgPoint.y = viewBoxY + normY * viewBoxHeight;

		/*DOMHELPER.create('circle', {
			attributes:{
				cx:svgPoint.x, 
				cy:svgPoint.y, 
				r:3, 
				fill:'rgba(255, 255, 255, 0.3)', 
				stroke:'none'
			}, 
			parent:elem
		});
		console.log(svgPoint);*/

		return svgPoint;
	}


	function checkDoubleTap(x, y) {
		var time = new Date().getTime();
		var newPoint = {
			x:x, 
			y:y
		}

		var validDoubleTap = false;
		for(var i = recentTouchTimes.length - 1; i >= 0; i--) {
			var recentTime = recentTouchTimes[i];

			// If too long between, drop recent time
			if(time - recentTime > doubleTapMaxDelayMs) {
				recentTouchTimes.pop();
				delete recentTouches[recentTime];
				continue;
			}
			// If too short, ignore
			else if(time - recentTime <= doubleTapMinDelayMs) {
				continue;
			}
			// Time is within range, must check distances
			else {
				var point = recentTouches[recentTime];

				// Check distance
				if(Math.abs(point.x - newPoint.x) < doubleTapMaxDist && Math.abs(point.y - newPoint.y) < doubleTapMaxDist) {
					// Valid double tap
					console.log('double tap!');
					//console.log(time);
					validDoubleTap = true;
					toggleStatePoint(newPoint.x, newPoint.y);

					// Reset, clearing out previous values
					recentTouchTimes = [];
					recentTouches = {};
					break;
				}
				// Distance too far, drop previous point and add new one
				else {
					recentTouchTimes.pop();
					delete recentTouches[recentTime];

					recentTouchTimes.unshift(time);
					recentTouches[time] = newPoint;
				}
			}
		}

		// Add to list
		if(!validDoubleTap) {
			recentTouchTimes.unshift(time);
			recentTouches[time] = newPoint;
		}
	}


	function onSvgClick(e) {
		checkDoubleTap(e.clientX, e.clientY);
	}


	function onTouchStart(e) {
		// New touch on screen - may be first touch
		// Change in num touches has occurred, recalculate start values

		//console.log(e);
		//console.log('onTouchStart');
		//console.log(gridWindow);

		// Ignore if dragging
		if(dragging) return;

		// Flag that touch events are being used
		useTouch = true;
		clearInterval(useTouchTimeoutId);

		// Indicate that application is navigating
		navigating = true;

		// Stop tweens that reset values based on boundaries
		gsap.killTweensOf(gridWindow, 'scale,targetScale,x,y,centerX,centerY,width,height,targetX,targetY');

		// Track properties, if not already
		var vt = VelocityTracker.getByTarget(gridWindow);
		if(vt == null) {
			InertiaPlugin.track(gridWindow, 'centerX,centerY,scale');
		}

		var numTouches = e.touches.length; // 1 - many

		// Set new starting values
		sDistStart = sDist = 0; // reset
		sTransformPointXStart = sTransformPointYStart = 0; // reset

		sScaleStart = gridWindow.targetScale; // set new start from current

		//console.log(e.touches[0].clientY);
		//console.log(e.touches[0].clientY - (headerHeight + readoutHeight));

		// Case: 1 touch
		if(numTouches == 1) {
			sTransformPointXStart = sTransformPointX = e.touches[0].clientX; // capture and set
			sTransformPointYStart = sTransformPointY = e.touches[0].clientY - svgTopOffset; // capture and set
		}

		// Case: 2+ touches
		// Calculate starting values for center, distances, scale
		else if(numTouches > 1) {
			var touchX;
			var touchY;

			// Find center, transform point
			for(var i = 0; i < numTouches; i++) {
				touchX = e.touches[i].clientX;
				touchY = e.touches[i].clientY - svgTopOffset;
				sTransformPointXStart += touchX / numTouches;
				sTransformPointYStart += touchY / numTouches;
			}

			// Calculate aggregate distance between points and their center
			for(var i = 0; i < numTouches; i++) {
				touchX = e.touches[i].clientX;
				touchY = e.touches[i].clientY - svgTopOffset;
				sDistStart += getDist(sTransformPointXStart, touchX, sTransformPointYStart, touchY);
			}

			sDist = sDistStart;
			sTransformPointX = sTransformPointXStart;
			sTransformPointY = sTransformPointYStart;
		}

		// Set regardless of # points
		gridWindow.transformX = gridWindow.x + (sTransformPointX / width * gridWindow.width);
		gridWindow.transformY = gridWindow.y + (sTransformPointY / svgHeight * gridWindow.height);
	}

	function onTouchMove(e) {
		// One or more touch points have moved
		// Current values need updating
		// Bounds checks and handling

		// Ignore if dragging
		if(dragging) return;

		disableAtomDragging();

		//console.log(e);
		//console.log('onTouchMove');
		//console.log(gridWindow);

		e.preventDefault(); // Prevents iOS browsers from adding page momentum

		var numTouches = e.touches.length; // 1 - many

		// Case: 1 touch
		// Move operation
		// From change in screen space pixel values, calculate updated grid space window values (x, y, w, h)
		if(numTouches == 1) {
			sTransformPointX = e.touches[0].clientX; // capture and set
			sTransformPointY = e.touches[0].clientY - svgTopOffset; // capture and set
			gridWindow.targetScale = gridWindow.scale;
		}

		// Case: 2+ touches
		// Move/Scale operation
		// From change in screen space transform point values, calculate updated grid space window values (x, y, w, h, scale)
		else if(numTouches > 1) {
			var touchX;
			var touchY;
			sDist = sTransformPointX = sTransformPointY = 0; // reset


			// Find center, transform point
			for(var i = 0; i < numTouches; i++) {
				touchX = e.touches[i].clientX;
				touchY = e.touches[i].clientY - svgTopOffset;
				sTransformPointX += touchX / numTouches;
				sTransformPointY += touchY / numTouches;
			}

			// Calculate aggregate distance between points and their center
			for(var i = 0; i < numTouches; i++) {
				touchX = e.touches[i].clientX;
				touchY = e.touches[i].clientY - svgTopOffset;
				sDist += getDist(sTransformPointX, touchX, sTransformPointY, touchY);
			}

			// Calculate current scale
			gridWindow.targetScale = sDist / sDistStart * sScaleStart;

			// Bounds check for scale
			var overScale;
			if(gridWindow.targetScale < minScaleSoft) {
				overScale = minScaleSoft - gridWindow.targetScale;
				gridWindow.scale = minScaleSoft + (minScaleDiff2 / (minScaleDiff + overScale)) - minScaleDiff;
			}
			else if(gridWindow.targetScale > maxScaleSoft) {
				overScale = gridWindow.targetScale - maxScaleSoft;
				gridWindow.scale = maxScaleSoft + maxScaleDiff * ((-1 / Math.pow((maxScaleFalloffRatio * overScale + 1), 2)) + 1);
			}
			else {
				gridWindow.scale = gridWindow.targetScale;
			}

			// Reset zoom offset
			curZoomLevel = null;
		}


		// Update window dimensions
		gridWindow.width = gridWindow.widthStart / gridWindow.scale;
		gridWindow.height = gridWindow.heightStart / gridWindow.scale;


		// Bounds check for X direction
		var overX;
		var minXSoft = svgMinX - gridWindow.width * 0.5;
		var minX = svgMinX - gridWindow.width * 0.75;
		var minXDiff = minXSoft - minX;
		var minXFalloffRatio = falloffScalar / minXDiff;

		var maxXSoft = svgMaxX - gridWindow.width * 0.5;
		var maxX = svgMaxX - gridWindow.width * 0.25;
		var maxXDiff = maxX - maxXSoft;
		var maxXFalloffRatio = falloffScalar / maxXDiff;

		gridWindow.targetX = gridWindow.transformX - (sTransformPointX / width) * gridWindow.width;

		if(gridWindow.targetX < minXSoft) {
			overX = minXSoft - gridWindow.targetX;
			gridWindow.x = minXSoft - minXDiff * ((-1 / Math.pow((minXFalloffRatio * overX + 1), 2)) + 1);
		}
		else if(gridWindow.targetX > maxXSoft) {
			overX = gridWindow.targetX - maxXSoft;
			gridWindow.x = maxXSoft + maxXDiff * ((-1 / Math.pow((maxXFalloffRatio * overX + 1), 2)) + 1);
		}
		else {
			gridWindow.x = gridWindow.targetX;
		}
		gridWindow.centerX = gridWindow.x + gridWindow.width * 0.5;

		// Bounds check for Y direction
		var overY;
		var minYSoft = svgMinY - gridWindow.height * 0.5;
		var minY = svgMinY - gridWindow.height * 0.75;
		var minYDiff = minYSoft - minY;
		var minYFalloffRatio = falloffScalar / minYDiff;

		var maxYSoft = svgMaxY - gridWindow.height * 0.5;
		var maxY = svgMaxY - gridWindow.height * 0.25;
		var maxYDiff = maxY - maxYSoft;
		var maxYFalloffRatio = falloffScalar / maxYDiff;

		gridWindow.targetY = gridWindow.transformY - (sTransformPointY / svgHeight) * gridWindow.height;

		if(gridWindow.targetY < minYSoft) {
			overY = minYSoft - gridWindow.targetY;
			gridWindow.y = minYSoft - minYDiff * ((-1 / Math.pow((minYFalloffRatio * overY + 1), 2)) + 1);
		}
		else if(gridWindow.targetY > maxYSoft) {
			overY = gridWindow.targetY - maxYSoft;
			gridWindow.y = maxYSoft + maxYDiff * ((-1 / Math.pow((maxYFalloffRatio * overY + 1), 2)) + 1);
		}
		else {
			gridWindow.y = gridWindow.targetY;
		}
		gridWindow.centerY = gridWindow.y + gridWindow.height * 0.5;

		// Redraw window
		//console.log(gridWindow.centerX + ', ' + gridWindow.centerY);
		draw();


	}

	function onTouchEnd(e) {
		// One less touch on the screen - may be last touch (0)

		// Ignore if dragging
		if(dragging) return;

		//console.log('onTouchEnd');
		//console.log(gridWindow);

		// Update starting values
		var numTouches = e.touches.length; // 1 - many

		// Set new starting values
		sTransformPointXStart = sTransformPointYStart = 0; // reset
		if(typeof sTransformPointX == 'undefined') sTransformPointX = sTransformPointY = 0;

		sScaleStart = gridWindow.targetScale; // set new start from current

		// Case: 1 touch
		if(numTouches == 1) {
			sTransformPointXStart = sTransformPointX = e.touches[0].clientX; // capture and set
			sTransformPointYStart = sTransformPointY = e.touches[0].clientY - svgTopOffset; // capture and set
			//targetScale = gridWindow.scale;
			startDist = dist = 0;
		}

		// Case: 2+ touches
		// Calculate starting values for center, distances, scale
		else if(numTouches > 1) {
			var touchX;
			var touchY;
			sDistStart = 0;

			// Find center, transform point
			for(var i = 0; i < numTouches; i++) {
				touchX = e.touches[i].clientX;
				touchY = e.touches[i].clientY - svgTopOffset;
				sTransformPointXStart += touchX / numTouches;
				sTransformPointYStart += touchY / numTouches;
			}

			// Calculate aggregate distance between points and their center
			for(var i = 0; i < numTouches; i++) {
				touchX = e.touches[i].clientX;
				touchY = e.touches[i].clientY - svgTopOffset;
				sDistStart += getDist(sTransformPointXStart, touchX, sTransformPointYStart, touchY);
			}

			sDist = sDistStart;
			sTransformPointX = sTransformPointXStart;
			sTransformPointY = sTransformPointYStart;
		}

		// Set regardless of # points
		gridWindow.transformX = gridWindow.x + (sTransformPointX / width * gridWindow.width);
		gridWindow.transformY = gridWindow.y + (sTransformPointY / svgHeight * gridWindow.height);

		// Return to bounds if outside
		//console.log(numTouches);
		var targetWidth = gridWindow.width;
		var targetHeight = gridWindow.height;
		if(numTouches <= 1) {

			// Update scale
			if(gridWindow.scale < minScaleSoft) {
				targetWidth = gridWindow.widthStart / minScaleSoft;
				targetHeight = gridWindow.heightStart / minScaleSoft;

				gsap.to(gridWindow, {
					duration:relaxDur, 
					scale:minScaleSoft, 
					targetScale:minScaleSoft, 
					ease:relaxEase, 
					callbackScope:this, 
					onUpdate:function() {
						gridWindow.width = gridWindow.widthStart / gridWindow.scale;
						gridWindow.height = gridWindow.heightStart / gridWindow.scale;
						gridWindow.x = gridWindow.transformX - (sTransformPointX / width) * gridWindow.width;
						gridWindow.y = gridWindow.transformY - (sTransformPointY / svgHeight) * gridWindow.height;
						gridWindow.centerX = gridWindow.x + gridWindow.width * 0.5;
						gridWindow.centerY = gridWindow.y + gridWindow.height * 0.5;
						draw();
					}, 
					onComplete:function() {
						curZoomLevel = 0;
						updateZoomButtons();
					}
				});
			}
			else if(gridWindow.scale > maxScaleSoft) {
				targetWidth = gridWindow.widthStart / maxScaleSoft;
				targetHeight = gridWindow.heightStart / maxScaleSoft;

				gsap.to(gridWindow, {
					duration:relaxDur, 
					scale:maxScaleSoft, 
					targetScale:maxScaleSoft, 
					ease:relaxEase, 
					callbackScope:this, 
					onUpdate:function() {
						gridWindow.width = gridWindow.widthStart / gridWindow.scale;
						gridWindow.height = gridWindow.heightStart / gridWindow.scale;
						gridWindow.x = gridWindow.transformX - (sTransformPointX / width) * gridWindow.width;
						gridWindow.y = gridWindow.transformY - (sTransformPointY / svgHeight) * gridWindow.height;
						gridWindow.centerX = gridWindow.x + gridWindow.width * 0.5;
						gridWindow.centerY = gridWindow.y + gridWindow.height * 0.5;
						draw();
					}, 
					onComplete:function() {
						curZoomLevel = zoomIncrements;
						updateZoomButtons();
					}
				});
			}

		}

		// Release, throw, or relax from boundaries; also, indicate that we're no longer navigating
		if(numTouches == 0) {
			// Indicate that application isn't navigating
			navigating = false;

			// Delayed call to reset whether touch is being used
			clearInterval(useTouchTimeoutId);
			useTouchTimeoutId = setTimeout(function(e) {
				useTouch = false;
				clearInterval(useTouchTimeoutId);
			}, 500);

			enableAtomDragging();

			var velocityX = 0;
			var velocityY = 0;
			var velocityScale = 0;

			//console.log(VelocityTracker.getByTarget(gridWindow));
			var vt = VelocityTracker.getByTarget(gridWindow);
			if(vt != null) {
				velocityX = InertiaPlugin.getVelocity(gridWindow, 'centerX');
				velocityY = InertiaPlugin.getVelocity(gridWindow, 'centerY');

				if(!isFinite(velocityX)) velocityX = 0;
				if(!isFinite(velocityY)) velocityY = 0;
				//console.log(velocityX + ', ' + velocityY);
				//InertiaPlugin.untrack(gridWindow, 'x,y');
				//vt.kill();
			}

			gsap.killTweensOf(gridWindow, 'x,y,centerX,centerY,scale');

			var minXSoft = svgMinX - targetWidth * 0.5;
			var maxXSoft = svgMaxX - targetWidth * 0.5;
			var minYSoft = -svgMaxY - targetHeight * 0.5;
			var maxYSoft = -svgMinY - targetHeight * 0.5;

			//console.log('throw: ' + velocityX.toFixed(2) + ', ' + velocityY.toFixed(2) + ', ' + velocityScale.toFixed(2) + ' (' + gridWindow.scale + ')');

			var checkXYBounds = false;

			// Check for x, y throw
			if(Math.abs(velocityX) > velocityXMin / gridWindow.scale || Math.abs(velocityY) > velocityYMin / gridWindow.scale) {
				// Throw X, Y
				gsap.to(gridWindow, { 
					inertia:{
						centerX:{
							velocity:velocityX, 
							max:maxXSoft + targetWidth * 0.5, 
							min:minXSoft + targetWidth * 0.5
						}, 
						centerY:{
							velocity:velocityY, 
							max:maxYSoft + targetHeight * 0.5, 
							min:minYSoft + targetHeight * 0.5
						}, 
						duration:{
							min:0.5, 
							max:1
						}, 
						//0.6 // overshootTolerance
					}, 
					ease:throwEase, 
					callbackScope:this, 
					overwrite:true, 
					onUpdate:function() {
						gridWindow.x = gridWindow.centerX - gridWindow.width * 0.5;
						gridWindow.y = gridWindow.centerY - gridWindow.height * 0.5;
						draw();
					}
				});
			}
			// X, Y bounds check flag
			else {
				checkXYBounds = true;
			}

			// Check X, Y bounds if not throwing X, Y
			if(checkXYBounds) {
				if(gridWindow.x < minXSoft) {
					gsap.to(gridWindow, {
						duration:relaxDur, 
						x:minXSoft, 
						centerX:minXSoft + gridWindow.width * 0.5, 
						targetX:minXSoft, 
						ease:relaxEase, 
						callbackScope:this, 
						onUpdate:function() {
							draw();
						}
					});
				}

				if(gridWindow.x > maxXSoft) {
					gsap.to(gridWindow, {
						duration:relaxDur, 
						x:maxXSoft, 
						centerX:maxXSoft + gridWindow.width * 0.5, 
						targetX:maxXSoft, 
						ease:relaxEase, 
						callbackScope:this, 
						onUpdate:function() {
							draw();
						}
					});
				}

				if(gridWindow.y < minYSoft) {
					gsap.to(gridWindow, {
						duration:relaxDur, 
						y:minYSoft, 
						centerY:minYSoft + gridWindow.height * 0.5, 
						targetY:minYSoft, 
						ease:relaxEase, 
						callbackScope:this, 
						onUpdate:function() {
							draw();
						}
					});
				}

				if(gridWindow.y > maxYSoft) {
					gsap.to(gridWindow, {
						duration:relaxDur, 
						y:maxYSoft, 
						centerY:maxYSoft + gridWindow.height * 0.5, 
						targetY:maxYSoft, 
						ease:relaxEase, 
						callbackScope:this, 
						onUpdate:function() {
							draw();
						}
					});
				}
			}
		}
	}


	function onMouseDown(e) {
		// Ignore if dragging
		if(dragging) return;

		// Ignore if using touch
		if(useTouch) return;

		mouseDragging = true;

		// Indicate that application is navigating
		navigating = true;

		gsap.killTweensOf(gridWindow, 'scale,targetScale,x,y,centerX,centerY,width,height,targetX,targetY');

		// Track properties, if not already
		var vt = VelocityTracker.getByTarget(gridWindow);
		if(vt == null) {
			InertiaPlugin.track(gridWindow, 'centerX,centerY');
		}

		// Set new starting values
		sDistStart = sDist = 0; // reset
		sTransformPointXStart = sTransformPointYStart = 0; // reset

		sScaleStart = gridWindow.targetScale; // set new start from current

		sTransformPointXStart = sTransformPointX = e.clientX; // capture and set
		sTransformPointYStart = sTransformPointY = e.clientY - svgTopOffset; // capture and set

		gridWindow.transformX = gridWindow.x + (sTransformPointX / width * gridWindow.width);
		gridWindow.transformY = gridWindow.y + (sTransformPointY / svgHeight * gridWindow.height);
	}

	function onMouseMove(e) {
		// Current values need updating
		// Bounds checks and handling

		// Ignore if dragging
		if(dragging) return;

		if(!mouseDragging) return;

		disableAtomDragging();

		e.preventDefault(); // Prevents iOS browsers from adding page momentum

		// From change in screen space pixel values, calculate updated grid space window values (x, y, w, h)
		sTransformPointX = e.clientX; // capture and set
		sTransformPointY = e.clientY - svgTopOffset; // capture and set
		gridWindow.targetScale = gridWindow.scale;

		// Update window dimensions
		gridWindow.width = gridWindow.widthStart / gridWindow.scale;
		gridWindow.height = gridWindow.heightStart / gridWindow.scale;

		// Bounds check for X direction
		var overX;
		var minXSoft = svgMinX - gridWindow.width * 0.5;
		var minX = svgMinX - gridWindow.width * 0.75;
		var minXDiff = minXSoft - minX;
		var minXFalloffRatio = falloffScalar / minXDiff;

		var maxXSoft = svgMaxX - gridWindow.width * 0.5;
		var maxX = svgMaxX - gridWindow.width * 0.25;
		var maxXDiff = maxX - maxXSoft;
		var maxXFalloffRatio = falloffScalar / maxXDiff;

		gridWindow.targetX = gridWindow.transformX - (sTransformPointX / width) * gridWindow.width;

		if(gridWindow.targetX < minXSoft) {
			overX = minXSoft - gridWindow.targetX;
			gridWindow.x = minXSoft - minXDiff * ((-1 / Math.pow((minXFalloffRatio * overX + 1), 2)) + 1);
		}
		else if(gridWindow.targetX > maxXSoft) {
			overX = gridWindow.targetX - maxXSoft;
			gridWindow.x = maxXSoft + maxXDiff * ((-1 / Math.pow((maxXFalloffRatio * overX + 1), 2)) + 1);
		}
		else {
			gridWindow.x = gridWindow.targetX;
		}
		gridWindow.centerX = gridWindow.x + gridWindow.width * 0.5;

		// Bounds check for Y direction
		var overY;
		var minYSoft = svgMinY - gridWindow.height * 0.5;
		var minY = svgMinY - gridWindow.height * 0.75;
		var minYDiff = minYSoft - minY;
		var minYFalloffRatio = falloffScalar / minYDiff;

		var maxYSoft = svgMaxY - gridWindow.height * 0.5;
		var maxY = svgMaxY - gridWindow.height * 0.25;
		var maxYDiff = maxY - maxYSoft;
		var maxYFalloffRatio = falloffScalar / maxYDiff;

		gridWindow.targetY = gridWindow.transformY - (sTransformPointY / svgHeight) * gridWindow.height;

		if(gridWindow.targetY < minYSoft) {
			overY = minYSoft - gridWindow.targetY;
			gridWindow.y = minYSoft - minYDiff * ((-1 / Math.pow((minYFalloffRatio * overY + 1), 2)) + 1);
		}
		else if(gridWindow.targetY > maxYSoft) {
			overY = gridWindow.targetY - maxYSoft;
			gridWindow.y = maxYSoft + maxYDiff * ((-1 / Math.pow((maxYFalloffRatio * overY + 1), 2)) + 1);
		}
		else {
			gridWindow.y = gridWindow.targetY;
		}
		gridWindow.centerY = gridWindow.y + gridWindow.height * 0.5;

		// Redraw window
		draw();


	}

	function onMouseUp(e) {

		// Ignore if dragging
		if(dragging) return;

		// Ignore if using touch
		if(useTouch) return;

		// Indicate that application isn't navigating
		navigating = false;
		enableAtomDragging();

		// Set new starting values
		sTransformPointXStart = sTransformPointYStart = 0; // reset

		sScaleStart = gridWindow.targetScale; // set new start from current

		sTransformPointXStart = sTransformPointX = e.clientX; // capture and set
		sTransformPointYStart = sTransformPointY = e.clientY - svgTopOffset; // capture and set
		startDist = dist = 0;

		// Set regardless of # points
		gridWindow.transformX = gridWindow.x + (sTransformPointX / width * gridWindow.width);
		gridWindow.transformY = gridWindow.y + (sTransformPointY / svgHeight * gridWindow.height);

		// Release, throw, or relax from boundaries
		var velocityX = 0;
		var velocityY = 0;

		var vt = VelocityTracker.getByTarget(gridWindow);
		if(vt != null) {
			velocityX = InertiaPlugin.getVelocity(gridWindow, 'centerX');
			velocityY = InertiaPlugin.getVelocity(gridWindow, 'centerY');

			if(!isFinite(velocityX)) velocityX = 0;
			if(!isFinite(velocityY)) velocityY = 0;
			//console.log(velocityX + ', ' + velocityY);
			//InertiaPlugin.untrack(gridWindow, 'x,y');
			//vt.kill();
		}

		var minXSoft = svgMinX - gridWindow.width * 0.5;
		var maxXSoft = svgMaxX - gridWindow.width * 0.5;
		var minYSoft = -svgMaxY - gridWindow.height * 0.5;
		var maxYSoft = -svgMinY - gridWindow.height * 0.5;

		//console.log('throw: ' + velocityX.toFixed(2) + ', ' + velocityY.toFixed(2) + ', ' + velocityScale.toFixed(2) + ' (' + gridWindow.scale + ')');

		var checkXYBounds = false;

		// Check for x, y throw
		if(Math.abs(velocityX) > velocityXMin / gridWindow.scale || Math.abs(velocityY) > velocityYMin / gridWindow.scale) {
			// Throw X, Y
			gsap.to(gridWindow, {
				inertia:{
					centerX:{
						velocity:velocityX, 
						max:maxXSoft + gridWindow.width * 0.5, 
						min:minXSoft + gridWindow.width * 0.5
					}, 
					centerY:{
						velocity:velocityY, 
						max:maxYSoft + gridWindow.height * 0.5, 
						min:minYSoft + gridWindow.height * 0.5
					}, 
					//0.6 // overshootTolerance
				}, 
				overwrite:true, 
				ease:throwEase, 
				callbackScope:this, 
				onUpdate:function() {
					gridWindow.x = gridWindow.centerX - gridWindow.width * 0.5;
					gridWindow.y = gridWindow.centerY - gridWindow.height * 0.5;
					draw();
				}, 
				duration:{
					min:0.5, 
					max:1
				}
			});
		}
		// X, Y bounds check flag
		else {
			checkXYBounds = true;
		}

		// Check X, Y bounds if not throwing X, Y
		if(checkXYBounds) {
			if(gridWindow.x < minXSoft) {
				gsap.to(gridWindow, {
					duration:relaxDur, 
					x:minXSoft, 
					centerX:minXSoft + gridWindow.width * 0.5, 
					targetX:minXSoft, 
					ease:relaxEase, 
					callbackScope:this, 
					onUpdate:function() {
						draw();
					}
				});
			}

			if(gridWindow.x > maxXSoft) {
				gsap.to(gridWindow, {
					duration:relaxDur, 
					x:maxXSoft, 
					centerX:maxXSoft + gridWindow.width * 0.5, 
					targetX:maxXSoft, 
					ease:relaxEase, 
					callbackScope:this, 
					onUpdate:function() {
						draw();
					}
				});
			}

			if(gridWindow.y < minYSoft) {
				gsap.to(gridWindow, {
					duration:relaxDur, 
					y:minYSoft, 
					centerY:minYSoft + gridWindow.height * 0.5, 
					targetY:minYSoft, 
					ease:relaxEase, 
					callbackScope:this, 
					onUpdate:function() {
						draw();
					}
				});
			}

			if(gridWindow.y > maxYSoft) {
				gsap.to(gridWindow, {
					duration:relaxDur, 
					y:maxYSoft, 
					centerY:maxYSoft + gridWindow.height * 0.5, 
					targetY:maxYSoft, 
					ease:relaxEase, 
					callbackScope:this, 
					onUpdate:function() {
						draw();
					}
				});
			}
		}

		mouseDragging = false;
	}


	function onTouchCancel(e) {
		//console.log(e);
	}


	function bodyTouchMove(e) {
		e.preventDefault();
	}

	function onWheel(e) {
		e.preventDefault();

		gsap.killTweensOf(gridWindow);

		//console.log(e);
		// deltaY
		// *clientX/Y
		// layerX/Y
		// offsetX/Y
		// pageX/Y
		// screenX/Y

		// Ignore if at scale boundaries
		if(e.deltaY < 0 && gridWindow.scale >= maxScaleSoft) return; // don't zoom in if at max scale
		else if(e.deltaY > 0 && gridWindow.scale <= minScaleSoft) return; // don't zoom out if at min scale

		// Calculate normalized X/Y position relative to DOM element where wheel event happened
		var cbr = svg.getBoundingClientRect();
		var normX = e.clientX / cbr.width;
		var normY = e.clientY / cbr.height;
		//console.log('DOM position %: ' + normX.toFixed(4) + ', ' + normY.toFixed(4));

		// Find start central point
		var startCenterX = gridWindow.centerX;
		var startCenterY = gridWindow.centerY;
		//console.log('SVG position: ' + startCenterX.toFixed(2) + ', ' + startCenterY.toFixed(2));

		// Determine new scale
		var scaleRange = maxScaleSoft - minScaleSoft;
		var wheelRange = 400;
		var wheelToScaleAmount = scaleRange / wheelRange; // wheel deltaY to scale change
		var deltaY = e.deltaY;
		if(e.deltaMode == 1) deltaY *= 40;
		var targetScale = gridWindow.scale - (deltaY * wheelToScaleAmount);
		if(targetScale > maxScaleSoft) targetScale = maxScaleSoft;
		else if(targetScale < minScaleSoft) targetScale = minScaleSoft;

		//curZoomLevel = null;
		targetZoomStop = null;
		updateZoomButtons();

		// Determine new width/height
		var targetWidth = gridWindow.widthStart / targetScale;
		var targetHeight = gridWindow.heightStart / targetScale;

		// Determine new X/Y position
		var targetX = startCenterX - (targetWidth * 0.5) + ((gridWindow.width - targetWidth) * (normX - 0.5));
		var targetY = startCenterY - (targetHeight * 0.5) + ((gridWindow.height - targetHeight) * (normY - 0.5));

		// Constrain X/Y to bounds
		var minX = svgMinX - targetWidth * 0.5;
		var maxX = svgMaxX - targetWidth * 0.5;
		var minY = svgMinY - targetHeight * 0.5;
		var maxY = svgMaxY - targetHeight * 0.5;

		if(targetX < minX) targetX = minX;
		else if(targetX > maxX) targetX = maxX;

		if(targetY < minY) targetY = minY;
		else if(targetY > maxY) targetY = maxY;

		// Calculate transformation X/Y
		var transformX = gridWindow.x + (gridWindow.width * normX);
		var transformY = gridWindow.y + (gridWindow.height * normY);

		// Animate to new scale
		gsap.to(gridWindow, {
			duration:0.5, 
			scale:targetScale, 
			targetScale:targetScale, 
			ease:'power2.out', 
			callbackScope:this, 
			onUpdate:function() {
				gridWindow.width = gridWindow.widthStart / gridWindow.scale;
				gridWindow.height = gridWindow.heightStart / gridWindow.scale;
				gridWindow.x = transformX - (e.clientX / width) * gridWindow.width;
				gridWindow.y = transformY - (e.clientY / svgHeight) * gridWindow.height;
				gridWindow.centerX = gridWindow.x + gridWindow.width * 0.5;
				gridWindow.centerY = gridWindow.y + gridWindow.height * 0.5;
				draw();
			}, 
			// On complete, check to see if the window needs to be returned in-bounds
			onComplete:function() {
				if(gridWindow.x < minX) {
					gsap.to(gridWindow, {
						duration:relaxDur, 
						x:minX, 
						centerX:minX + gridWindow.width * 0.5, 
						targetX:minX, 
						ease:relaxEase, 
						onUpdate:function() {
							draw();
						}
					});
				}

				if(gridWindow.x > maxX) {
					gsap.to(gridWindow, {
						duration:relaxDur, 
						x:maxX, 
						centerX:maxX + gridWindow.width * 0.5, 
						targetX:maxX, 
						ease:relaxEase, 
						onUpdate:function() {
							draw();
						}
					});
				}

				if(gridWindow.y < minY) {
					gsap.to(gridWindow, {
						duration:relaxDur, 
						y:minY, 
						centerY:minY + gridWindow.height * 0.5, 
						targetY:minY, 
						ease:relaxEase, 
						onUpdate:function() {
							draw();
						}
					});
				}

				if(gridWindow.y > maxY) {
					gsap.to(gridWindow, {
						duration:relaxDur, 
						y:maxY, 
						centerY:maxY + gridWindow.height * 0.5, 
						targetY:maxY, 
						ease:relaxEase, 
						onUpdate:function() {
							draw();
						}
					});
				}
			}
		});
	}


	function zoomToPoint(x, y, scale, dur) {
		//console.log(scale);
		// Ignore if at scale boundaries
		//if(e.deltaY < 0 && gridWindow.scale >= maxScaleSoft) return; // don't zoom in if at max scale
		//else if(e.deltaY > 0 && gridWindow.scale <= minScaleSoft) return; // don't zoom out if at min scale

		// Find start central point
		var startCenterX = gridWindow.centerX;
		var startCenterY = gridWindow.centerY;
		//console.log('SVG position: ' + startCenterX.toFixed(2) + ', ' + startCenterY.toFixed(2));

		//console.log('startX: ' + gridWindow.x);
		//console.log('startCenterX: ' + startCenterX);
		//console.log('startWidth: ' + gridWindow.width);

		// Capture scale info
		var startScale = gridWindow.scale;
		var targetScale = scale;
		//if(targetScale > maxScaleSoft) targetScale = maxScaleSoft;
		//else if(targetScale < minScaleSoft) targetScale = minScaleSoft;
		var scaleDiff = Math.abs(targetScale - startScale);

		//curZoomLevel = null;

		// Determine new width/height
		var targetWidth = gridWindow.widthStart / targetScale;
		var targetHeight = gridWindow.heightStart / targetScale;

		// Determine new X/Y position
		var targetX = x - (targetWidth * 0.5);
		var targetY = y - (targetHeight * 0.5);

		//console.log('targetX: ' + startCenterX);
		//console.log('targetCenterX: ' + x);
		//console.log('targetWidth: ' + targetWidth);

		//DOMHELPER.create('circle', { attributes:{cx:x, cy:y, r:5, fill:'#ffffff'}, parent:elem });

		// Constrain X/Y to bounds
		/*var minX = svgMinX - targetWidth * 0.5;
		var maxX = svgMaxX - targetWidth * 0.5;
		var minY = svgMinY - targetHeight * 0.5;
		var maxY = svgMaxY - targetHeight * 0.5;

		if(targetX < minX) targetX = minX;
		else if(targetX > maxX) targetX = maxX;

		if(targetY < minY) targetY = minY;
		else if(targetY > maxY) targetY = maxY;*/

		// Animate to new scale
		gsap.to(gridWindow, {
			duration:dur, 
			scale:targetScale, 
			targetScale:targetScale, 
			//x:targetX, 
			//y:targetY, 
			//centerX:x * 1 / (width / gridWindow.scale / gridWindow.width), 
			//centerY:y * 1 / (svgHeight / gridWindow.scale / gridWindow.height), 
			centerX:x, 
			centerY:y, 
			ease:'power2.out', 
			onUpdate:function() {
				// Update width/height
				gridWindow.width = gridWindow.widthStart / gridWindow.scale;
				gridWindow.height = gridWindow.heightStart / gridWindow.scale;
				gridWindow.x = gridWindow.centerX - (gridWindow.width * 0.5); //width / gridWindow.width / gridWindow.scale
				gridWindow.y = gridWindow.centerY - (gridWindow.height * 0.5);

				// If scale is changing, manually update x/y positions
				/*if(scaleDiff != 0) {
					// Start and target centers
					var scx = startCenterX;
					var scy = startCenterY;
					var tcx = x;
					var tcy = y;

					// Calculate normalized progress based on scale change
					var ss = startScale;
					var ts = targetScale;
					var cs = gridWindow.scale;

					var norm = (ts - cs) / (ts - ss);

					// Determine current center x, y
					var ccx = scx + (tcx - scx) * (1 - norm);
					var ccy = scy + (tcy - scy) * (1 - norm);
					
					// Adjustments to accommodate window scaling
					ccx *= 1 / (width / gridWindow.scale / gridWindow.width);
					ccy *= 1 / (svgHeight / gridWindow.scale / gridWindow.height);
					//console.log(ccx.toFixed(2) + ', ' + gridWindow.width.toFixed(2) + ', ' + (width / gridWindow.scale).toFixed(2) + ', ' + (width / gridWindow.scale / gridWindow.width).toFixed(2));

					// Current x, y
					gridWindow.x = ccx - (gridWindow.width * 0.5);
					gridWindow.y = ccy - (gridWindow.height * 0.5);
					gridWindow.centerX = ccx;
					gridWindow.centerY = ccy;
				}*/

				draw();
			}
		});
	}


	function zoomToRect(x, y, w, h, dur) {
		/*console.log('zoomToRect:');
		console.log(x + ', ' + y + ', ' + w + ', ' + h);
		DOMHELPER.create('rect', {
			attributes:{
				x:x, 
				y:y, 
				width:w, 
				height:h, 
				fill:'none', 
				stroke:'#ffffff'
			}, 
			parent:elem
		});*/
		// Calculate target center x, y, scale
		var targetCenterX = x + (w * 0.5);
		var targetCenterY = y + (h * 0.5);

		// Determine scale in order to fit new rectangle within space
		var currentAr = width / svgHeight;
		var targetAr = w / h;
		var targetScale = 1;
		var defaultScale = currentAr > 1 ? height / defaultHeight : width / defaultWidth;
		console.log(defaultScale);

		// Target aspect ratio is more "landscape" than current aspect ratio, determine scale based on width
		if(targetAr > currentAr) {
			//targetScale = gridWindow.scale * gridWindow.widthStart / w;
			//targetScale = gridWindow.scale * 1 / (gridWindow.widthStart / w);
			//targetScale = gridWindow.widthStart / w;
			//targetScale = 1 / (width / gridWindow.scale / w);
			//targetScale = (width / defaultWidth) / (w / gridWindow.width);
			//targetScale = gridWindow.scale * (gridWindow.width / w);
			//targetScale = (gridWindow.scale * gridWindow.width) / width;
			//targetScale = (gridWindow.width / w) * (gridWindow.scale * gridWindow.width) / width;
			//targetScale = (gridWindow.scale / defaultScale) * (gridWindow.width / w);
			targetScale = (defaultScale) * (defaultWidth / w);
		}
		// Target aspect ratio is more "portrait" than current aspect ratio, determine scale based on height
		else {
			//targetScale = gridWindow.scale * gridWindow.heightStart / h;
			//targetScale = gridWindow.scale * 1 / (gridWindow.heightStart / h);
			//targetScale = gridWindow.heightStart / h;
			//targetScale = 1 / (height / gridWindow.scale / h);
			//targetScale = (height / defaultHeight) / (h / gridWindow.height);
			//targetScale = gridWindow.scale * (gridWindow.height / h);
			//targetScale = (gridWindow.scale * gridWindow.height) / height;
			//targetScale = (gridWindow.height / h) * (gridWindow.scale * gridWindow.height) / height;
			//targetScale = (gridWindow.scale / defaultScale) * (gridWindow.height / h);
			targetScale = (defaultScale) * (defaultHeight / h);
		}

		zoomToPoint(
			targetCenterX * 1 / (width / gridWindow.scale / gridWindow.width), // (gridWindow.scale * gridWindow.width) / width
			targetCenterY * 1 / (height / gridWindow.scale / gridWindow.height), 
			targetScale, 
			dur
		);
	}


	function draw() {
		// Quick escape to avoid concurrent draw calls
		if(drawing) return;
		drawing = true;

		// Calculate updates to the SVG, including viewBox coordinates
		var scaleX = width / gridWindow.width;
		var scaleY = svgHeight / gridWindow.height;

		var svgScalar = svgScale / gridWindow.scale;
		var svgScalarX = scaleX * svgScalar;
		var svgScalarY = scaleY * svgScalar;

		//var viewBoxX = gridWindow.x * svgScalarX;
		//var viewBoxY = gridWindow.y * svgScalarY;
		var viewBoxWidth = width * svgScalar;
		var viewBoxHeight = svgHeight * svgScalar;
		var viewBoxX = (gridWindow.centerX * svgScalarX) - viewBoxWidth * 0.5;
		var viewBoxY = (gridWindow.centerY * svgScalarY) - viewBoxHeight * 0.5;

		// Escape if NaN is getting computed - this will cause a crash when attempting to set viewBox properties
		//console.log(viewBoxX + ' ' + viewBoxY + ' ' + viewBoxWidth + ' ' + viewBoxHeight);
		if(isNaN(viewBoxX) || isNaN(viewBoxY) || isNaN(viewBoxWidth) || isNaN(viewBoxHeight)) {
			drawing = false;
			return;
		}

		// Update viewBox
		svg.setAttribute('viewBox', viewBoxX + ' ' + viewBoxY + ' ' + viewBoxWidth + ' ' + viewBoxHeight);

		drawing = false;
	};



	function resize() {
		var oldWidth = width;
		var oldHeight = svgHeight;

		// Grab new window dimensions
		width = document.body.getBoundingClientRect().width;
		height = document.body.getBoundingClientRect().height;
		document.body.height = height;

		if(width == oldWidth && height == oldHeight) return;

		ar = width / height;

		defaultWidth = defaultWidth * width / oldWidth;
		defaultHeight = defaultHeight * svgHeight / oldHeight;
		defaultXStart = -defaultWidth * 0.5;
		defaultYStart = -defaultHeight * 0.5;

		svgHeight = height;

		initScale = ar > 1 ? height / defaultHeight : width / defaultWidth;

		// Resize stuff
		gridWindow.width = gridWindow.width * width / oldWidth;
		gridWindow.height = gridWindow.height * svgHeight / oldHeight;
		gridWindow.x = gridWindow.centerX - gridWindow.width * 0.5;
		gridWindow.y = gridWindow.centerY - gridWindow.height * 0.5;

		gridWindow.widthStart = defaultWidth;
		gridWindow.heightStart = defaultHeight;

		// Update SVG width, height
		gsap.set(svg, {
			top:svgTopOffset, 
			width:width, 
			height:height
		});

		zoomToPoint(gridWindow.centerX, gridWindow.centerY, gridWindow.scale, 0);

		//draw();
	}


	function zoomIn() {

		// If there isn't a target zoom stop, determine next largest one based on current scale
		if(targetZoomStop == null) {
			for(var i = 0; i < zoomStops.length; i++) {
				targetZoomStop = i;
				if(zoomStops[i] > gridWindow.scale) break;
			}
		}
		// Else zoom in to next increment, if possible
		else {
			targetZoomStop++;
			if(targetZoomStop > zoomStops.length - 1) targetZoomStop = zoomStops.length - 1;
		}

		// Update zoom buttons
		updateZoomButtons();

		// Zoom in
		zoomToPoint(
			gridWindow.centerX, 
			gridWindow.centerY, 
			zoomStops[targetZoomStop], 
			0.5
		);

		dragging = false;
	}

	function zoomOut() {

		// If there isn't a target zoom stop, determine next largest one based on current scale
		if(targetZoomStop == null) {
			for(var i = zoomStops.length; i >= 0; i--) {
				targetZoomStop = i;
				if(zoomStops[i] < gridWindow.scale) break;
			}
		}
		// Else zoom in to prev increment, if possible
		else {
			targetZoomStop--;
			if(targetZoomStop <= 0) targetZoomStop = 0;
		}

		// Update zoom buttons
		updateZoomButtons();

		// Zoom in
		zoomToPoint(
			gridWindow.centerX, 
			gridWindow.centerY, 
			zoomStops[targetZoomStop], 
			0.5
		);

		dragging = false;
	}

	function updateZoomButtons() {
		gsap.set([zoomInButton, zoomOutButton], {
			opacity:1
		});

		var targetStop = targetZoomStop;
		if(targetStop == null) {
			for(var i = 0; i < zoomStops.length; i++) {
				targetStop = i;
				if(zoomStops[i] > gridWindow.scale) break;
			}
		}

		// Temporarily disabled - not working properly
		/*if(targetStop == zoomStops.length - 1) {
			gsap.set(zoomInButton, {
				opacity:0.5
			});
		}
		else if(targetStop == 0) {
			gsap.set(zoomOutButton, {
				opacity:0.5
			});
		}*/

		//console.log(targetStop);
		//console.log(zoomStops[targetStop] + ' vs. ' + gridWindow.scale);
	}


	function updateAtomsDragging() {
		if(state == STATE_POSITIONING) {
			for(var i = 0; i < atoms.length; i++) {
				var atom = atoms[i];
				if(atom.parentMolecule != null) {
					if(atom.parentMolecule.dragging) {
						dragging = true;
						return;
					}
				}
				else if(atom.dragging) {
					dragging = true;
					return;
				}
			}
		}
		else {
			for(var i = 0; i < atoms.length; i++) {
				var atom = atoms[i];
				for(var j = 0; j < atom.bondDraggables.length; j++) {
					var bondDraggable = atom.bondDraggables[j];
					if(bondDraggable.vars.dragging) {
						dragging = true;
						return;
					}
				}
			}
		}
		
		dragging = false;
	}

	function disableAtomDragging() {
		for(var i = 0; i < atoms.length; i++) {
			var atom = atoms[i];
			if(!atom.draggable.enabled()) atom.draggable.disable();
			atom.enableBondDraggables(false);
		}
	}

	function enableAtomDragging() {
		//console.log('enableAtomDragging');
		for(var i = 0; i < atoms.length; i++) {
			var atom = atoms[i];
			if(atom.parentMolecule == null) {
				if(!atom.draggable.enabled()) atom.draggable.enable();
			}

			if(state == STATE_BONDING) {
				atom.enableBondDraggables(true);
			}
		}
	}

	function setState(newState) {
		if(newState == STATE_POSITIONING && state != newState) {
			state = newState;

			// Switch button modes
			gsap.set(modePositioningButton, {
				alpha:1
			});
			gsap.set(modeBondingButton, {
				alpha:0.5
			});

			modeToggleLabel.innerHTML = 'position&nbsp;atoms';
			gsap.set(document.getElementById('outline-dilation'), {
				attr:{
					'radius':1
				}
			});

			// Turn off atom bonding
			for(var i = 0; i < atoms.length; i++) {
				var atom = atoms[i];
				atom.toggleBonding(false);
			}

			for(var i = 0; i < molecules.length; i++) {
				var molecule = molecules[i];
				molecule.toggleBonding(false);
			}

			// Bond break buttons
			gsap.to(elem.querySelectorAll('.bond-break'), {
				duration:0.25, 
				autoAlpha:0, 
				onComplete:function() {
					display:'none'
				}
			});

			// Electron highlighting
			gsap.to(elem.querySelectorAll('.electron .free'), {
				duration:0.25, 
				fill:'hsla(0, 100%, 100%, 0.25)', 
				scale:1
			});

			for(var i = 0; i < atoms.length; i++) {
				var atom = atoms[i];

				for(var j = 0; j < atom.electrons.length; j++) {
					var electron = atom.electrons[j];
					if(electron.type == 'normal') {
						electron.stopHighlight();
					}
				}
			}

			// Background color
			gsap.to(elem, {
				duration:0.25, 
				backgroundColor:'#19b394'
			});

			gsap.killTweensOf(document.getElementById('footer-overlay-lingrad').querySelectorAll('stop'));
			gsap.to(document.getElementById('footer-overlay-lingrad').querySelectorAll('stop'), {
				duration:0.25, 
				'stop-color':'#19b394'
			});

			// Background grid
			gsap.killTweensOf('.grid-line');
			gsap.to('.grid-line', {
				duration:0.25, 
				autoAlpha:1
			});
		}
		else if(newState == STATE_BONDING && state != newState) {
			state = newState;

			// Switch button modes
			gsap.set(modePositioningButton, {
				alpha:0.5
			});
			gsap.set(modeBondingButton, {
				alpha:1
			});

			modeToggleLabel.innerHTML = 'bond&nbsp;atoms';
			gsap.set(document.getElementById('outline-dilation'), {
				attr:{
					'radius':1
				}
			});

			// Turn on atom bonding
			for(var i = 0; i < atoms.length; i++) {
				var atom = atoms[i];
				atom.toggleBonding(true);
			}

			for(var i = 0; i < molecules.length; i++) {
				var molecule = molecules[i];
				molecule.toggleBonding(true);
			}

			// Bond break buttons
			gsap.to(elem.querySelectorAll('.bond-break'), {
				duration:0.25, 
				onStart:function() {
					display:'inherit'
				}, 
				autoAlpha:1
			});

			// Electron highlighting
			gsap.to(elem.querySelectorAll('.electron .free'), {
				duration:0.25, 
				fill:'hsla(0, 100%, 100%, 1)', 
				scale:1.2
			});

			for(var i = 0; i < atoms.length; i++) {
				var atom = atoms[i];

				for(var j = 0; j < atom.electrons.length; j++) {
					var electron = atom.electrons[j];
					if(electron.type == 'normal') {
						electron.startHighlight();
					}
				}
			}

			// Background color
			gsap.to(elem, {
				duration:0.25, 
				backgroundColor:'#178276'
			});

			gsap.killTweensOf(document.getElementById('footer-overlay-lingrad').querySelectorAll('stop'));
			gsap.to(document.getElementById('footer-overlay-lingrad').querySelectorAll('stop'), {
				duration:0.25, 
				'stop-color':'#178276'
			});

			// Background grid
			gsap.killTweensOf('.grid-line');
			gsap.to('.grid-line', {
				duration:0.25, 
				autoAlpha:0.25
			});
		}
	}

	function toggleStatePoint(x, y) {

		var point = screenToSvg(x, y);
		var radius = gridWindow.width > gridWindow.height ? gridWindow.height : gridWindow.width;

		var ripple = DOMHELPER.create('circle', {
			attributes:{
				cx:point.x, 
				cy:point.y, 
				r:radius * 0.5
			}, 
			styles:{
				stroke:'none', 
				fill:state == STATE_POSITIONING ? '#178276' : '#19b394', 
				transformOrigin:'50% 50%', 
				scale:0
			}, 
			classes:['toggle-ripple', 'no-select'], 
			parent:elem
		});

		var tl = gsap.timeline({
			onStart:function() {
				gsap.to('.toggle-ripple', {
					duration:0.25, 
					fill:state == STATE_POSITIONING ? '#178276' : '#19b394'
				});
				toggleState();
			}, 
			onComplete:function() {
				ripple.parentNode.removeChild(ripple);
			}
		});

		tl.to(ripple, {
			duration:0.5, 
			scale:1, 
			ease:'power1.out'
		}, 0);

		tl.to(ripple, {
			duration:0.5, 
			alpha:0, 
			ease:'power2.out'
		}, 0);

	}

	function toggleState() {
		if(state == STATE_POSITIONING) {
			setState(STATE_BONDING);
			gsap.set(modePositioningButton, {
				alpha:0.5
			});
			gsap.set(modeBondingButton, {
				alpha:1
			});
		}
		else {
			setState(STATE_POSITIONING);
			gsap.set(modePositioningButton, {
				alpha:1
			});
			gsap.set(modeBondingButton, {
				alpha:0.5
			});
		}

		dragging = false;
	}

	function getTargetPositionsGeneric(obj, targetPosition) {
		var atomList = [];

		if(obj.type == 'atom') {
			atomList = [obj];
		}
		else {
			atomList = obj.atoms;
		}

		var positions = [];

		for(var i = 0; i < atomList.length; i++) {
			var atom = atomList[i];
			var position = {};

			if(atom.parentMolecule != null) {
				position.x = atom.posX + targetPosition.x;
				position.y = atom.posY + targetPosition.y;
			}
			else {
				position.x = targetPosition.x;
				position.y = targetPosition.y;
			}

			positions.push(position);
		}

		return positions;
	}

	function getOtherAtomPositionsGeneric(obj) {
		var atomList = [];

		if(obj.type == 'atom') {
			atomList = [obj];
		}
		else {
			atomList = obj.atoms;
		}

		var positions = [];

		for(var i = 0; i < atoms.length; i++) {
			var otherAtom = atoms[i];

			// Ignore if atom is contained within array
			if(atomList.indexOf(otherAtom) != -1) continue;

			var position = {};

			if(otherAtom.parentMolecule != null) {
				position.x = otherAtom.posX + otherAtom.parentMolecule.posX;
				position.y = otherAtom.posY + otherAtom.parentMolecule.posY;
			}
			else {
				position.x = otherAtom.posX;
				position.y = otherAtom.posY;
			}

			positions.push(position);
		}

		return positions;
	}

	function getNearestOpenPositionGeneric(obj, targetPosition, startPosition) {
		var targetPositions = getTargetPositionsGeneric(obj, targetPosition);
		var occupiedPositions = getOtherAtomPositionsGeneric(obj);
		//console.log(targetPosition);
		//console.log(occupiedPositions);

		// progression of square side dimension: 3, 5, 7, 9, 11 ...
		// num spaces per square = 2 * side + 2 * (side - 2)
		// offset progression (3), starting N and progressing CW: 
		// 	x: 0, 1, 1, 1, 0, -1, -1, -1
		// 	y: -1, -1, 0, 1, 1, 1, 0, -1 (start at +6)
		// offset progression (5), starting N and progressing CW: 
		// 	x: 0, 1, 2, 2, 2, 2, 2, 1, 0, -1, -2, -2, -2, -2, -2, -1
		// 	y: -2, -2, -2, -1, 0, 1, 2, 2, 2, 2, 2, 1, 0, -1, -2, -2 (start at +12)

		// Quick check to see if target position is available
		var targetPositionOpen = true;

		for(var i = 0; i < occupiedPositions.length; i++) {
			var otherPos = occupiedPositions[i];

			//console.log('comparing ' + targetPosition.x + ', ' + targetPosition.y + ' to ' + otherPos.x + ', ' + otherPos.y);

			for(var j = 0; j < targetPositions.length; j++) {
				var tPosition = targetPositions[j];

				// Check against other atoms to see if the target position is already occupied
				if(tPosition.x == otherPos.x && tPosition.y == otherPos.y) {
					targetPositionOpen = false;
				}

				if(!targetPositionOpen) break;
			}
		}

		// If nothing is occupying target position, return it
		if(targetPositionOpen) {
			//console.log('target position open');
			return {
				x:targetPosition.x, 
				y:targetPosition.y
			}
		}

		// If target position is not open, we need to start searching for the next available open space around the target
		var maxSidePositions = Math.round((svgMaxX - svgMinX) / gridSpacing);

		// Loop through expanding squares around the target position
		for(var side = 3; side < maxSidePositions; side+=2) { // Starts at side length = 3, then progresses 5, 7, 9, etc.
			var numSpaces = 2 * side + 2 * (side - 2);
			var maxPos = Math.floor(side / 2); // Helps limit position crawling to a square shape

			// x and y coordinates
			var xs = [];
			var ys = [];

			// Find x-position coordinates (positive)
			for(var i = 0, j = Math.round(numSpaces / 2); i < numSpaces / 2; i++, j--) {
				var x = i < numSpaces / 4 ? i : j; // 0, 1, 2, 3, 4, 3, 2, 1

				// Clamp position value
				if(x > maxPos) x = maxPos;

				xs.push(x);
			}

			// Add x-position coordinates (flip negative)
			xs = xs.concat(xs);
			for(var i = Math.round(xs.length) / 2; i < xs.length; i++) {
				xs[i] = -xs[i];
			}

			// Add y positions
			var yStart = Math.round(3 / 4 * numSpaces);
			ys = xs.slice(yStart).concat(xs.slice(0, yStart));

			// Walk through x/y positions, look for non-matches that are within bounds
			for(var i = 0; i < xs.length; i++) { // Loop through starting positions

				// Init to reasonable defaults in case things fail
				var x = startPosition.x;
				var y = startPosition.y;

				// Offsets stored
				var offsetX = 0;
				var offsetY = 0;

				// Assume position is open - crawling through will find collisions and mark it as false
				var nearbyTargetPositionOpen = true;

				// Loop through each atom position (with offset) of this molecule, comparing to occupied spaces
				for(var j = 0; j < targetPositions.length; j++) {
					// Escape if already flagged false
					if(!nearbyTargetPositionOpen) break;

					var tPosition = targetPositions[j];
					x = tPosition.x + xs[i] * gridSpacing;
					y = tPosition.y + ys[i] * gridSpacing;
					offsetX = xs[i] * gridSpacing;
					offsetY = ys[i] * gridSpacing;

					// Bounds check
					if(x < svgMinX || x > svgMaxX || y < svgMinY || y > svgMaxY) {
						nearbyTargetPositionOpen = false;
						break;
					}

					// Compare against other atom positions
					for(var k = 0; k < occupiedPositions.length; k++) {
						var otherPos = occupiedPositions[k];

						// Check against other atoms to see if this position is already occupied
						if(x == otherPos.x && y == otherPos.y) {
							nearbyTargetPositionOpen = false;
						}

						// Escape if flagged false
						if(!nearbyTargetPositionOpen) break;
					}
				}

				// If nothing is occupying this nearby position, return it
				if(nearbyTargetPositionOpen) {
					if(obj.type == 'atom') {
						return {
							x:x, 
							y:y
						}
					}
					else {
						return {
							x:targetPosition.x + offsetX, 
							y:targetPosition.y + offsetY
						}
					}
				}
			}
		}

		// If all else fails, return atom to starting position
		return {
			x:startPosition.x, 
			y:startPosition.y
		}
	}

	// -------


	function getSnapshot(elem, type) {
		// Copy stage
		var snapshotHtml = elem.innerHTML;

		var frag = document.createDocumentFragment();

		var snapshot = DOMHELPER.create('div', {
			classes:['snapshot'], 
			parent:frag
		});

		// Add correct/incorrect indicator
		if(typeof type == 'string') {
			DOMHELPER.addClass(snapshot, type);

			var snapshotIndicator = DOMHELPER.create('svg', {
				attributes:{
					'preserveAspectRatio':'xMidYMid meet', 
					'viewBox':'0 0 64 64'
				}, 
				classes:['snapshot-indicator'], 
				parent:snapshot
			});

			if(type == 'wrong') {
				var snapshotIndicatorCorner = DOMHELPER.create('path', {
					attributes:{
						fill:'#cc0000', 
						stroke:'none', 
						d:'M 0 0 h 64 l -64 64z'
					}, 
					parent:snapshotIndicator
				});

				var snapshotIndicatorPath = DOMHELPER.create('path', {
					attributes:{
						fill:'none', 
						stroke:'#ffffff', 
						'stroke-width':4, 
						'stroke-linecap':'round', 
						d:'M 10 10 l 15 15 M 10 25 l 15 -15'
					}, 
					parent:snapshotIndicator
				});
			}
			else if(type == 'correct') {
				var snapshotIndicatorCorner = DOMHELPER.create('path', {
					attributes:{
						fill:'#00d656', 
						stroke:'none', 
						d:'M 0 0 h 64 l -64 64z'
					}, 
					parent:snapshotIndicator
				});

				var snapshotIndicatorPath = DOMHELPER.create('path', {
					attributes:{
						fill:'none', 
						stroke:'#ffffff', 
						'stroke-width':4, 
						'stroke-linecap':'round', 
						d:'M 10 20 l 6 6 l 12 -12'
					}, 
					parent:snapshotIndicator
				});
			}
		}

		var snapshotSvg = DOMHELPER.create('svg', {
			attributes:{
				'preserveAspectRatio':'xMidYMid meet'
			}, 
			styles:{
				width:'100%', 
				height:'100%'
			}, 
			classes:['snapshot-image'], 
			parent:snapshot
		});

		var g = DOMHELPER.create('g', {
			classes:['snapshot-bounds'], 
			parent:svgSnapshot
		});
		g.innerHTML = snapshotHtml;

		// Remove unnecessary elements
		var defs = g.querySelectorAll('defs');
		for(var i = 0; i < defs.length; i++) {
			defs[i].parentNode.removeChild(defs[i]);
		}

		var bg = g.querySelectorAll('.grid-line');
		for(var i = 0; i < bg.length; i++) {
			bg[i].parentNode.removeChild(bg[i]);
		}

		var symbols = g.querySelectorAll('.symbol');
		for(var i = 0; i < symbols.length; i++) {
			symbols[i].parentNode.removeChild(symbols[i]);
		}

		var lonePairs = g.querySelectorAll('.lone');
		for(var i = 0; i < lonePairs.length; i++) {
			lonePairs[i].parentNode.removeChild(lonePairs[i]);
		}

		var electronHighlights = g.querySelectorAll('.electron-highlight');
		for(var i = 0; i < electronHighlights.length; i++) {
			electronHighlights[i].parentNode.removeChild(electronHighlights[i]);
		}

		var bondBreaks = g.querySelectorAll('.bond-break');
		for(var i = 0; i < bondBreaks.length; i++) {
			bondBreaks[i].parentNode.removeChild(bondBreaks[i]);
		}

		var bondTrails = g.querySelectorAll('.bond-trail');
		for(var i = 0; i < bondTrails.length; i++) {
			bondTrails[i].parentNode.removeChild(bondTrails[i]);
		}

		var bondDrags = g.querySelectorAll('.bond-drag');
		for(var i = 0; i < bondDrags.length; i++) {
			bondDrags[i].parentNode.removeChild(bondDrags[i]);
		}

		// Update atom colors
		var snapshotAtoms = g.querySelectorAll('.atom');
		for(var i = 0; i < snapshotAtoms.length; i++) {
			var a = snapshotAtoms[i];
			var type = a.getAttribute('data-atom-type');
			var bg = a.querySelector('circle.atom-background');
			DOMHELPER.addClass(bg, type + '-snapshot');
			gsap.set(bg, {
				clearProps:'fill,stroke'
			});
		}

		// Scale up bonds
		var snapshotBonds = g.querySelectorAll('.bond');
		for(var i = 0; i < snapshotBonds.length; i++) {
			var b = snapshotBonds[i];
			gsap.set(b, {
				scale:1.3, 
				transformOrigin:'50% 50%'
			});
		}

		var snapshotBondLines = g.querySelectorAll('.bond-line');
		for(var i = 0; i < snapshotBondLines.length; i++) {
			var b = snapshotBondLines[i];
			gsap.set(b, {
				strokeWidth:2, 
				stroke:'#ffffff'
			});
		}


		// Grab bounding box to determine SVG viewBox
		var bbox = g.getBBox();

		var padding = 5;

		var x = bbox.x - padding;
		var y = bbox.y - padding;
		var w = bbox.width + padding * 2;
		var h = bbox.height + padding * 2;

		snapshotSvg.setAttribute('viewBox', x + ' ' + y + ' ' + w + ' ' + h);
		snapshotSvg.appendChild(g);

		return snapshot;
	}


	function addRecentAttempt(molecule, messages, type) {
		// Save attempt to list
		var attemptElem = getSnapshot(molecule.elem, type);
		
		if(typeof recentAttempts[currentGame.id] == 'undefined') recentAttempts[currentGame.id] = [];
		recentAttempts[currentGame.id].unshift({
			elem:attemptElem, 
			messages:messages
		});

		attemptElem.addEventListener('click', function(e) {
			showRecentAttempt({
				elem:attemptElem, 
				messages:messages
			});
		})

		recentAttemptsList.prepend(attemptElem);

		// Update recent attempts button (make sure it's indicating contents are present)
		gsap.set(recentAttemptsButton, {
			alpha:1
		});

		if(type == 'wrong') {
			// Snapshot effect
			var snapshotPolaroid = DOMHELPER.create('div', {
				classes:['snapshot-polaroid']
			});
			var snapshotImage = getSnapshot(molecule.elem);
			var snapshotMessage = DOMHELPER.create('div', {
				classes:['snapshot-message']
			});
			snapshotMessage.innerHTML = messages.join('. ');

			// Clear out timeline if it exists
			if(recentAttemptsSnapshotTl != null) {
				recentAttemptsSnapshotTl.kill();
				recentAttemptsSnapshotTl = null;
			}

			recentAttemptsSnapshotTl = gsap.timeline({
				onStart:function() {
					gsap.set(recentAttemptsSnapshot, {
						'overflow-y':'visible'
					});
					recentAttemptsSnapshot.innerHTML = '';
					recentAttemptsSnapshot.appendChild(snapshotImage);
					recentAttemptsSnapshot.appendChild(snapshotPolaroid);
					recentAttemptsSnapshot.appendChild(snapshotMessage);
				}, 
				onComplete:function() {
					snapshotImage.remove();
					snapshotPolaroid.remove();
					snapshotMessage.remove();
				}
			});

			// Initialize elements
			recentAttemptsSnapshotTl.set(snapshotPolaroid, {
				autoAlpha:1
			}, 0);

			recentAttemptsSnapshotTl.set(snapshotImage, {
				position:'absolute'
			}, 0);

			recentAttemptsSnapshotTl.set(snapshotMessage, {
				autoAlpha:0
			});

			// Fade out polaroid overlay
			recentAttemptsSnapshotTl.to(snapshotPolaroid, 0.5, {
				autoAlpha:0, 
				ease:'power2.out'
			}, 0);

			// Show message
			recentAttemptsSnapshotTl.to(snapshotMessage, 0.3, {
				autoAlpha:1
			}, 0.3);

			// After a moment, fade out message
			recentAttemptsSnapshotTl.to(snapshotMessage, 0.3, {
				autoAlpha:0
			}, '+=8');

			// Tweak overflow-y
			recentAttemptsSnapshotTl.set(recentAttemptsSnapshot, {
				'overflow-y':'hidden'
			});

			// Move polaroid out of view
			recentAttemptsSnapshotTl.to(snapshotImage, 0.5, {
				y:-100, 
				ease:'power2.in'
			});
		}
	}


	function showRecentAttempt(attempt) {
		// Clear out current display
		recentAttemptDisplaySnapshot.innerHTML = '';
		recentAttemptDisplayMessage.innerHTML = '';

		// Duplicate snapshot element
		var snapshot = DOMHELPER.create('div', {
			styles:{
				height:'100%'
			}, 
			parent:recentAttemptDisplaySnapshot
		});
		snapshot.innerHTML = attempt.elem.innerHTML;

		// Remove indicator (not necessary here)
		snapshot.removeChild(snapshot.querySelector('.snapshot-indicator'));

		// Create message element
		var message = DOMHELPER.create('span', {
			parent:recentAttemptDisplayMessage
		});
		message.innerHTML = attempt.messages.join('<br /><br />');

		// Show display
		var tl = gsap.timeline();

		tl.to([recentAttemptDisplay, recentAttemptDisplayOverlay], 0.5, {
			autoAlpha:1
		});
	}

	function hideRecentAttempt() {
		var tl = gsap.timeline();

		tl.to([recentAttemptDisplay, recentAttemptDisplayOverlay], 0.5, {
			autoAlpha:0
		});
	}


	function showCorrectMolecule(molecule, gameObj) {
		// Clear out current display
		moleculeCorrectDisplaySnapshot.innerHTML = '';
		moleculeCorrectDisplayRepresentations.innerHTML = '';

		// Duplicate snapshot element
		var snapshot = DOMHELPER.create('div', {
			styles:{
				height:'100%'
			}, 
			parent:moleculeCorrectDisplaySnapshot
		});

		var snapshotSvg = DOMHELPER.create('svg', {
			attributes:{
				'preserveAspectRatio':'xMidYMid meet'
			}, 
			parent:snapshot
		});

		snapshotSvg.innerHTML = molecule.elem.innerHTML;

		var bbox = molecule.elem.getBBox();

		var padding = 5;

		var x = bbox.x - padding;
		var y = bbox.y - padding;
		var w = bbox.width + padding * 2;
		var h = bbox.height + padding * 2;

		gsap.set(snapshotSvg, {
			width:'100%', 
			height:'100%', 
			attr:{
				'viewBox':x + ' ' + y + ' ' + w + ' ' + h
			}
		});

		// Create representations elements
		for(var i = 0; i < gameObj.representations.length; i++) {
			let repObj = gameObj.representations[i]
			let rep = DOMHELPER.create('img', {
				attributes:{
					src:repObj.image
				}, 
				classes:['represenation-image'], 
				parent:moleculeCorrectDisplayRepresentations
			});

			rep.addEventListener('click', function(e) {
				showRepresentation(repObj);
			});
		}
	}


	function showRepresentation(representationObj) {
		console.log(representationObj.image);

		// Clear out current display
		representationDisplayImg.src = '';

		// Duplicate snapshot element
		representationDisplayImg.src = representationObj.image;		

		// Show display
		var tl = gsap.timeline();

		tl.to([representationDisplay, representationDisplayOverlay], 0.5, {
			autoAlpha:1
		});
	}

	function hideRepresentation() {
		var tl = gsap.timeline();

		tl.to([representationDisplay, representationDisplayOverlay], 0.5, {
			autoAlpha:0
		});
	}


	function updateFeedback() {
		var tooFar = false;
		var noFreeElectrons = false;
		var noFreeElectronsH = false;
		var noFreeElectronsN = false;
		var noFreeElectronsO = false;
		var noFreeElectronsF = false;
		var noFreeElectronsCl = false;
		var noFreeElectronsBr = false;
		var tooManyBonds = false;

		// Loop through atoms, gather updated feedback
		for(var i = 0; i < atoms.length; i++) {
			var atom = atoms[i];
			var atomFeedback = atom.getBondErrors();

			tooFar = tooFar || atomFeedback.tooFar;
			noFreeElectrons = noFreeElectrons || atomFeedback.noFreeElectrons;
			noFreeElectronsH = noFreeElectronsH || atomFeedback.noFreeElectronsH;
			noFreeElectronsN = noFreeElectronsN || atomFeedback.noFreeElectronsN;
			noFreeElectronsO = noFreeElectronsO || atomFeedback.noFreeElectronsO;
			noFreeElectronsF = noFreeElectronsF || atomFeedback.noFreeElectronsF;
			noFreeElectronsCl = noFreeElectronsCl || atomFeedback.noFreeElectronsCl;
			noFreeElectronsBr = noFreeElectronsBr || atomFeedback.noFreeElectronsBr;
			tooManyBonds = tooManyBonds || atomFeedback.tooManyBonds;
		}

		// Compare with old values to see if a change occurred
		if(
			feedbackTooFar != tooFar || 
			feedbackNoFreeElectrons != noFreeElectrons || 
			feedbackNoFreeElectronsH != noFreeElectronsH || 
			feedbackNoFreeElectronsN != noFreeElectronsN || 
			feedbackNoFreeElectronsO != noFreeElectronsO || 
			feedbackNoFreeElectronsF != noFreeElectronsF || 
			feedbackNoFreeElectronsCl != noFreeElectronsCl || 
			feedbackNoFreeElectronsBr != noFreeElectronsBr || 
			feedbackTooManyBonds != tooManyBonds
		) {
			// Change has occurred, update values
			feedbackTooFar = tooFar;
			feedbackNoFreeElectrons = noFreeElectrons;
			feedbackNoFreeElectronsH = noFreeElectronsH;
			feedbackNoFreeElectronsN = noFreeElectronsN;
			feedbackNoFreeElectronsO = noFreeElectronsO;
			feedbackNoFreeElectronsF = noFreeElectronsF;
			feedbackNoFreeElectronsCl = noFreeElectronsCl;
			feedbackNoFreeElectronsBr = noFreeElectronsBr;
			feedbackTooManyBonds = tooManyBonds;

			var feedbackText = [];
			if(tooFar) feedbackText.push(feedbackTextTooFar);
			if(noFreeElectronsH) feedbackText.push(feedbackTextNoFreeElectronsH);
			if(noFreeElectronsN) feedbackText.push(feedbackTextNoFreeElectronsN);
			if(noFreeElectronsO) feedbackText.push(feedbackTextNoFreeElectronsO);
			if(noFreeElectronsF) feedbackText.push(feedbackTextNoFreeElectronsF);
			if(noFreeElectronsCl) feedbackText.push(feedbackTextNoFreeElectronsCl);
			if(noFreeElectronsBr) feedbackText.push(feedbackTextNoFreeElectronsBr);
			if(tooManyBonds) feedbackText.push(feedbackTextTooManyBonds);

			// If not displaying an atom-specific message about no free electrons, display a generic one
			if(
				!noFreeElectronsH && 
				!noFreeElectronsN && 
				!noFreeElectronsO && 
				!noFreeElectronsF && 
				!noFreeElectronsCl && 
				!noFreeElectronsBr
			) {
				if(noFreeElectrons) feedbackText.push(feedbackTextNoFreeElectrons);
			}

			//console.log(feedbackText);

			gsap.killTweensOf(feedbackDisplay);

			// No error feedback, hide feedback
			if(feedbackText.length == 0) {
				gsap.to(feedbackDisplay, {
					duration:0.3, 
					autoAlpha:0, 
					y:-50, 
					ease:'power2.in'
				});
			}
			else {
				// Update text, show feedback
				feedbackDisplay.innerHTML = feedbackText.join('');
				gsap.killTweensOf(feedbackDisplay);
				gsap.to(feedbackDisplay, {
					duration:0.2, 
					autoAlpha:1, 
					y:0, 
					ease:'back.out(1.7)'
				});
			}
		}
	}

	function feedbackToast(message) {
		feedbackDisplay.innerHTML = message;
		gsap.killTweensOf(feedbackDisplay);

		var tl = gsap.timeline();

		tl.to(feedbackDisplay, {
			duration:0.2, 
			autoAlpha:1, 
			y:0, 
			ease:'back.out(1.7)'
		}, 0);

		tl.to(feedbackDisplay, {
			duration:0.3, 
			autoAlpha:0, 
			y:-50, 
			ease:'power2.in'
		}, '+=4');
	}


	function showAbout() {
		// Set video attribute
		document.getElementById('about-video').setAttribute('src', 'https://www.youtube.com/embed/xVJfsdDfMV0');

		// Show display
		var tl = gsap.timeline();

		tl.to([aboutScreen, aboutScreenOverlay], 0.5, {
			autoAlpha:1
		});
	}

	function hideAbout() {
		var tl = gsap.timeline({
			onComplete:function() {
				// Clear video attribute
				document.getElementById('about-video').setAttribute('src', '');
			}
		});

		tl.to([aboutScreen, aboutScreenOverlay], 0.5, {
			autoAlpha:0
		});
	}

	function showHelp() {
		// Show display
		var tl = gsap.timeline();

		tl.to([helpScreen, helpScreenOverlay], 0.5, {
			autoAlpha:1
		});
	}

	function hideHelp() {
		var tl = gsap.timeline();

		tl.to([helpScreen, helpScreenOverlay], 0.5, {
			autoAlpha:0
		});
	}


	function debugLog(text) {
		var scroller = document.getElementById('debug-scroller');
		if(scroller) {
			scroller.innerHTML = '<p>' + text + '</p>' + scroller.innerHTML;
		}
	}


	function getDist(x1, x2, y1, y2) {
		return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
	}

	function svgNs(tag) {
		return document.createElementNS('http://www.w3.org/2000/svg', tag);
	}


	return {
		init: init, 
		get fragment() {
			return fragment;
		}, 
		get elem() {
			return elem;
		}, 
		get gridWindow() {
			return gridWindow;
		}, 
		get dragging() {
			return dragging;
		}, 
		get navigating() {
			return navigating;
		}, 
		set dragging(bool) {
			dragging = bool;
		}, 
		get bounds() {
			return {
				minX:svgMinX, 
				maxX:svgMaxX, 
				minY:svgMinY, 
				maxY:svgMaxY
			}
		}, 
		get gridSpacing() {
			return gridSpacing;
		}, 
		get gridWidth() {
			return gridWidth;
		}, 
		get gridHeight() {
			return gridHeight;
		}, 
		get atoms() {
			return atoms;
		}, 
		get molecules() {
			return molecules;
		}, 
		get state() {
			return state;
		}, 
		get STATE_POSITIONING() {
			return STATE_POSITIONING;
		}, 
		get STATE_BONDING() {
			return STATE_BONDING;
		}, 
		get feedbackTooFar() {
			return feedbackTooFar;
		}, 
		set feedbackTooFar(num) {
			feedbackTooFar = num;
		}, 
		get feedbackNoFreeElectrons() {
			return feedbackNoFreeElectrons;
		}, 
		set feedbackNoFreeElectrons(num) {
			feedbackNoFreeElectrons = num;
		}, 
		get feedbackTooManyBonds() {
			return feedbackTooManyBonds;
		}, 
		set feedbackTooManyBonds(num) {
			feedbackTooManyBonds = num;
		}, 
		get recentAttempts() {
			return recentAttempts;
		}, 
		updateFeedback: updateFeedback, 
		draw: draw, 
		resize: resize, 
		updateAtomsDragging: updateAtomsDragging, 
		getTargetPositionsGeneric: getTargetPositionsGeneric, 
		getNearestOpenPositionGeneric: getNearestOpenPositionGeneric, 
		debugLog: debugLog, 
		setState: setState, 
		loadGame: loadGame, 
		clearGame: clearGame, 
		get moleculeIds() {
			var ids = [];
			for(var i = 0; i < molecules.length; i++) {
				ids.push(molecules[i].id);
			}
			return ids;
		}, 
		zoomToPoint: zoomToPoint, 
		zoomToRect: zoomToRect, 
		getSnapshot: getSnapshot
	}

})();