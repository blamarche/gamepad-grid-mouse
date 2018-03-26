
var robot = require("robotjs");

//events
el('save').onclick = saveConfig;

var grid = {'sz': 25, 'sx': 400, 'sy': 300, 'rd': 100, 'rdf': 500};
var map = {'u':12, 'd': 13, 'l': 14, 'r': 15, 'cl': 0, 'cr': 1, 'gc': 3, 'pr': 2, 'sl': 4};
var mapState = {'u':null, 'd': null, 'l': null, 'r': null, 'cl': null, 'cr': null, 'gc': null, 'pr': null, 'sl': null};

loadConfig();


function loadConfig() {
	var tmp_map = localStorage.getItem('map');
	var tmp_grid = localStorage.getItem('grid');
	try { 
		if (tmp_map != null && typeof tmp_map!='undefined')
			map = JSON.parse(tmp_map);
		if (tmp_grid != null && typeof tmp_grid!='undefined')
			grid = JSON.parse(tmp_grid);
	} catch (err) {
		console.log(err);
	}
	fillConfigForm();
}

function saveConfig() {
	map.u = parseInt(el('u').value);
	map.d = parseInt(el('d').value);
	map.l = parseInt(el('l').value);
	map.r = parseInt(el('r').value);
	map.cl = parseInt(el('cl').value);
	map.cr = parseInt(el('cr').value);
	map.gc = parseInt(el('gc').value);
	map.pr = parseInt(el('pr').value);
	map.sl = parseInt(el('sl').value);
	
	grid.sz = parseInt(el('gsz').value);
	grid.sx = parseInt(el('gsx').value);
	grid.sy = parseInt(el('gsy').value);
	grid.rd = parseInt(el('rd').value);
	grid.rdf = parseInt(el('rdf').value);
	
	localStorage.setItem('map', JSON.stringify(map));
	localStorage.setItem('grid', JSON.stringify(grid));
	alert("Config saved!");
}

function fillConfigForm() {
	el('u').value = map.u;
	el('d').value = map.d;
	el('l').value = map.l;
	el('r').value = map.r;
	el('cl').value = map.cl;
	el('cr').value = map.cr;
	el('gc').value = map.gc;
	el('pr').value = map.pr;	
	el('sl').value = map.sl;	
	
	el('gsz').value = grid.sz;	
	el('gsx').value = grid.sx;	
	el('gsy').value = grid.sy;
	el('rd').value = grid.rd;	
	el('rdf').value = grid.rdf;	
}

//--------------------------------

setTimeout(checkGamePad, 100);
function checkGamePad() {
	var gp = navigator.getGamepads()[0];
	if (gp!=null) {		
		setupGamepad(gp);
	} else {
		setTimeout(checkGamePad, 100);
	}
}

function setupGamepad(gp) {
	el('start').style.display='none';
	el('inst').style.display='block';

	var html = "<h5>"+gp.id+"</h5>";
	for(var i=0;i<gp.buttons.length;i++) {
		html+= "<div class='btnstate' id='btn"+i+"'>"+i+"</div>";		
	}
	el('debug').innerHTML = html;	

	window.setInterval(reportGamepad, 16);	
}

function reportGamepad() {
	var gp = navigator.getGamepads()[0];
	
	try {
		//output gp state	
		for(var i=0;i<gp.buttons.length;i++) {
			if(gp.buttons[i].pressed) {
				el('btn'+i).classList.add('pressed');
			} else {
				el('btn'+i).classList.remove('pressed');
			}
		}
			
		//update map states	
		for (var k in map) {
			if (gp.buttons[map[k]].pressed && mapState[k]==null) {
				mapState[k] = 'first';	
			} else if (!gp.buttons[map[k]].pressed && mapState[k]!=null) {
				//if left/right click release mouse button		
				if (k=='cl') {
					robot.mouseToggle('up', 'left');
				}
				if (k=='cr') {
					robot.mouseToggle('up', 'right');
				}			
				mapState[k]=null;
			} else if (!gp.buttons[map[k]].pressed) {
				mapState[k]=null;
			}
		}
		
		//button logic
		for (var k in mapState) { 
			if (mapState[k]=='first') { //first press
				mapState[k] = 'first-'+(new Date()).getTime().toString();
				trigger(k);
			} else if (mapState[k]!=null && k!='pr' && k!='gc' && k!='cl' && k!='cr') {			
				//check against interval timediff
				var rd = grid.rd;
				var ms = mapState[k];
				if (typeof mapState[k]=="string") {
					ms = parseFloat(mapState[k].substring(6));
					rd = grid.rdf;
				}
				var tm = (new Date()).getTime();
				if (tm - ms >= rd) {					
					mapState[k] = tm;
					trigger(k);
				}
			}
		}
		
	} catch (err) {
		console.log(err);
	}	
}

var gsconfstep = 0;
function trigger(k) {
	var mp = robot.getMousePos();
	
	var sz=grid.sz;
	if (mapState['sl']!=null) sz=2;	//slow mode move speed

	switch (k) {
		case 'cl': 
			robot.mouseToggle('down', 'left');
			break;
		case 'cr': 
			robot.mouseToggle('down', 'right'); 
			break;
		case 'u': 					
			robot.moveMouse(mp.x, mp.y-sz);
			break;
		case 'd': 
			robot.moveMouse(mp.x, mp.y+sz);
			break;
		case 'l': 
			robot.moveMouse(mp.x-sz, mp.y);
			break;
		case 'r': 
			robot.moveMouse(mp.x+sz, mp.y);
			break;
		case 'gc': 
			if (gsconfstep==0) {
				var mp = robot.getMousePos();
				grid.sx = mp.x;
				grid.sy = mp.y;
				fillConfigForm();
				gsconfstep=1;
				var notif = new Notification('Grid Reset Position Set', {body: 'Grid reset position set. Move to the next grid line and press again to set the size.'});
			} else if (gsconfstep == 1) {
				var mp = robot.getMousePos();
				grid.sz = (Math.abs(mp.x - grid.sx) > Math.abs(mp.y - grid.sy)) ? Math.abs(mp.x - grid.sx) : Math.abs(mp.y - grid.sy);
				fillConfigForm();
				gsconfstep=0;
				var notif = new Notification('Grid Size Set', {body: 'Grid size was set to '+grid.sz+'px'});
			}
			break;
		case 'pr': 
			robot.moveMouse(grid.sx, grid.sy);
			break;
	}	
}

//--------------------------------

function el(id) {
	return document.getElementById(id);
}

