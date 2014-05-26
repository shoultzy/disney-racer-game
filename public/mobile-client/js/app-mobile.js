var socket = io.connect('http://localhost:5000/');
//var socket = io.connect('http://disney-racer-game.herokuapp.com/');

var userID = '0001';

var btnAccelerate = document.getElementById("btnAccelerate");
btnAccelerate.addEventListener("mousedown", onUserInput);
btnAccelerate.addEventListener("mouseup", onUserInput);
btnAccelerate.addEventListener("mouseout", onUserInput);
btnAccelerate.addEventListener('touchstart', onUserInput);
btnAccelerate.addEventListener('touchend', onUserInput);
btnAccelerate.addEventListener('touchleave', onUserInput);
btnAccelerate.name = 'btnAccelerate';


var btnReverse = document.getElementById("btnReverse");
btnReverse.addEventListener("mousedown", onUserInput);
btnReverse.addEventListener("mouseup", onUserInput);
btnReverse.addEventListener("mouseout", onUserInput);
btnReverse.addEventListener('touchstart', onUserInput);
btnReverse.addEventListener('touchend', onUserInput);
btnReverse.addEventListener('touchleave', onUserInput);
btnReverse.name = 'btnReverse';


function onUserInput(event){
		
	switch(event.type){
		
		case 'touchstart':
		case 'mousedown':
			event.currentTarget.name == 'btnAccelerate' ? socket.emit('update_world_data', { userUID: userID, userAcceleration: 1 }) : socket.emit('update_world_data', { userUID: userID, userAcceleration: -1 });
		break;

		case 'touchleave':
		case 'mouseup':
		case 'mouseout':
			socket.emit('update_world_data', { userUID: userID, userAcceleration: 0 });
		break;
	}	
};

if (window.DeviceMotionEvent != undefined) {
	window.ondevicemotion = function(event) {  
	    var accelerationX = event.accelerationIncludingGravity.x;  
	    var accelerationY = event.accelerationIncludingGravity.y;  
	    var accelerationZ = event.accelerationIncludingGravity.z;  
	    
	   /* console.log('accelerationX:  ', accelerationX);
	    console.log('accelerationY:  ', accelerationY);
	    console.log('accelerationZ:  ', accelerationZ);*/
	}
};

