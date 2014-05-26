var socket = io.connect('http://localhost:5000/');
//var socket = io.connect('http://disney-racer-game.herokuapp.com/');

var userAcceleration = 0;
var userID = '0001';

socket.on('on_receive_world_data', function (data) {
	//console.log('dataReceived');
	userAcceleration = data.userAcceleration;
});

setInterval(receiveWorldData, 10);

function receiveWorldData(){
	//console.log('sendRequest');
	socket.emit('on_request_world_data', userID);
}