var UTIL = (function() {
	
	function getDist(x1, x2, y1, y2) {
		return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
	}

	function getDegreeDist(d1, d2) {
		var m1 = mod(d1, 360);
		var m2 = mod(d2, 360);
		return Math.min(Math.abs(m2 - m1), Math.min(Math.abs(m2 - m1 - 360), Math.abs(m2 - m1 + 360)));
	}

	function getDegreeAngle(x1, x2, y1, y2) {
		//return mod(Math.atan((-y2 + y1) / (x2 - x1)) * 180 / Math.PI, 360);
		//return mod(Math.atan((y2 - y1) / (x2 - x1)) * 180 / Math.PI, 360);
		//return mod(Math.atan2((x2 - x1), (y2 - y1)) * 180 / Math.PI - 90, 360);
		//return mod(-Math.atan2((x2 - x1), (y2 - y1)) * 180 / Math.PI - 90, 360);
		//var deg = Math.atan2((x2 - x1), (y2 - y1)) * 180 / Math.PI;
		var deg = Math.atan2((y2 - y1), (x2 - x1)) * 180 / Math.PI;
		//if(y2 < y1) deg *= -1;
		return mod(deg, 360);
	}

	// Borrowed and modified from https://web.archive.org/web/20090717035140if_/javascript.about.com/od/problemsolving/a/modulobug.htm
	function mod(a, b) {
		return ((a % b) + b) % b;
	}

	function rand(min, max) {
		return min + (Math.random() * (max - min));
	}

	function randInt(min, max) {
		return Math.floor(min + (Math.random() * (max - min)));
	}

	return {
		getDist: getDist, 
		getDegreeDist: getDegreeDist, 
		getDegreeAngle: getDegreeAngle, 
		mod: mod, 
		rand: rand, 
		randInt: randInt
	}

})();