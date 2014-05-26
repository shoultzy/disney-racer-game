var socket = io.connect('http://localhost:5000/');
//var socket = io.connect('http://disney-racer-game.herokuapp.com/');

var btn = document.getElementById("btn");
btn.addEventListener("mousedown", onUserInput);
btn.addEventListener("mouseup", onUserInput);
btn.addEventListener("mouseout", onUserInput);

btn.addEventListener('touchstart', onUserInput);
btn.addEventListener('touchend', onUserInput);
btn.addEventListener('touchleave', onUserInput);


//var pressNum = 0;

function onUserInput(event){
	
	console.log(event.type);
	
	switch(event.type){
		
		case 'touchstart':
			socket.emit('update_world_data', { userUID: '0000', userAcceleration: 1 });
		break;
		
		case 'touchend':
			socket.emit('update_world_data', { userUID: '0000', userAcceleration: 0 });
		break;
		
		case 'touchleave':
			socket.emit('update_world_data', { userUID: '0000', userAcceleration: 0 });
		break;
		
		case 'mousedown':
			socket.emit('update_world_data', { userUID: '0000', userAcceleration: 1 });
		break;
		
		case 'mouseup':
			socket.emit('update_world_data', { userUID: '0000', userAcceleration: 0 });
		break;
		
		case 'mouseout':
			socket.emit('update_world_data', { userUID: '0000', userAcceleration: 0 });
		break;
	}
	
	//pressNum++;
}