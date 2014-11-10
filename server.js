// HTTP Portion
var http = require('http');
var fs = require('fs'); // Using the filesystem module
var httpServer = http.createServer(requestHandler);
var url = require('url');
httpServer.listen(8080);

function requestHandler(req, res) {

	var parsedUrl = url.parse(req.url);
	console.log("The Request is: " + parsedUrl.pathname);
	
	// Read index.html	
	fs.readFile(__dirname + parsedUrl.pathname, 
		// Callback function for reading
		function (err, data) {
			// if there is an error
			if (err) {
				res.writeHead(500);
				return res.end('Error loading ' + parsedUrl.pathname);
			}
			// Otherwise, send the data, the contents of the file
			res.writeHead(200);
			res.end(data);
  		}
  	);
  	
}

// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io').listen(httpServer);

// Empty array to hold clients
var clients = [];

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', 
	// We are given a websocket object in our function
	function (socket) {

		console.log("connected");
		// Add new clients to our array
		clients.push(socket.id);
		console.log(clients);
		// Send out array of all clients
		io.sockets.emit('clientList',clients);
		
		// Show which users are moving where, and send the values
		socket.on('positionChange', function(values){
			console.log(socket.id + "__" + values.a + " " + values.b + " " + values.g);
			var clientvals = [socket.id, values];
			socket.broadcast.emit('positionChangeServer', clientvals);
		})

		// Disconnect clients and remove them from array
		socket.on('disconnect', function() {
			console.log("Client has disconnected " + socket.id);
			clients.splice(clients.indexOf(socket.id), 1);
			console.log(clients);
		});
	}
);

