var express = require('express'),
    app,
    server;

app = express();
server = require('http').createServer(app);

app.use(express.static(__dirname + '/public'));

var port = Number(process.env.PORT || 5000);
//var port = Number(5000);
var io = require('socket.io').listen(port);
var mongoClient = require('mongodb').MongoClient;

io.sockets.on('connection', function(socket) {
	
	console.log('onConnection');
});

mongoClient.connect('mongodb://heroku_app25601055:9q4lt9502mvcp0ebuu3run97ae@ds053218.mongolab.com:53218/heroku_app25601055/user_worldData', function(err, db) {
	initCollection(db);
});

function initCollection(db) {
	db.collectionNames('global_world_data', function(err, names) {
		var collection;

		if (names.length === 1) {
			collection = db.collection('global_world_data');

			verifyCollection(db, collection);
		} else {
			db.createCollection('global_world_data', {
				capped : true,
				size : 102400
			}, function(err, collection) {
				console.log('Created collection');

				verifyCollection(db, collection);
			});
		}
	});
}

function initSockets(collection) {
	
	io.sockets.on('connection', function(socket) {
		
		
		//collection.insert({userUID : '0000', userAction : 'mouseUp'}, function(err) {
			//console.log('Wrote', data);
		//});
		
		socket.on('update_world_data', function(data) {
			
			collection.update(
				{ userUID : data.userUID },
				{ userUID : data.userUID, userAction: data.userAction },
				{ upsert : true },
				function(err){
					console.log('Wrote', data);
				}
			);
		});
		
		socket.on('on_request_world_data', function(UID) {
						
			var stream = collection.find({ 'userUID': UID }, {
				tailable : 1,
				awaitdata : false,
				numberOfRetries : -1
			}).sort({
				$natural : -1
			}).stream();
			
			stream.on('data', function(data) {
				socket.emit('on_receive_world_data', data);
			});
		});
	});
}

function verifyCollection(db, collection) {
	collection.isCapped(function(err, capped) {
		if (capped) {
			initSockets(collection);
		} else {
			console.log('Not a capped collection');

			db.dropCollection('global_world_data', function(err) {
				console.log('Dropped collection');

				initCollection(db);
			});
		}
	});
}