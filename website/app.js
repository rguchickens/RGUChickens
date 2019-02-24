var app = require('http').createServer(handler)
var io = require('socket.io')(app)
var url = require('url')
var fs = require('fs')
var Gpio = require('onoff').Gpio;
var motion = new Gpio(27, 'in',  'both');
var pirState=false;
//This will open a server at localhost:5000. Navigate to this in your browser.
app.listen(5000);

// Http handler function
function handler (req, res) {

    // Using URL to parse the requested URL
    var path = url.parse(req.url).pathname;

    // Managing the root route
    if (path == '/') {
        index = fs.readFile(__dirname+'/public/Dashboard.html',
            function(error,data) {

                if (error) {
                    res.writeHead(500);
                    return res.end("Error: unable to load Dashboard.html");
                }

                res.writeHead(200,{'Content-Type': 'text/html'});
                res.end(data);
            });
    // Managing the route for the javascript files
    } else if( /\.(js)$/.test(path) || /\.(css)$/.test(path)) {
        index = fs.readFile(__dirname+'/public'+path,
            function(error,data) {

                if (error) {
                    res.writeHead(500);
                    return res.end("Error: unable to load " + path);
                }

                res.writeHead(200,{'Content-Type': 'text/plain'});
                res.end(data);
            });
    } else {
        res.writeHead(404);
        res.end("Error: 404 - File not found.");
    }

}
// Web Socket Connection
io.sockets.on('connection', function (socket) {

  // If we recieved a command from a client to start watering lets do so
  socket.on('example-ping', function(data) {
      console.log("ping");

      delay = data["duration"];

      // Set a timer for when we should stop watering
      setTimeout(function(){
          socket.emit("example-pong");
      }, delay*1000);

  });

});
process.stdin.resume();
process.on('SIGUSR2',() => {
	console.log("motion!");
	io.sockets.emit('motion');

});
motion.watch(function (err, value) {
	if(err) {
		console.error('There was an error', err);
	}
	else
	{
	console.log(value)
		if(value==1) {
			if(!pirState) {
				console.log('motion !');
				io.sockets.emit('motion');
				pirState=true;
			}
		}
		else
		{
			if(pirState=true)
			{
				pirState=false;
			}
		}
	}
});


function unexportOnClose() { //function to run when exiting program
//  LED.writeSync(0); // Turn LED off
//  LED.unexport(); // Unexport LED GPIO to free resources
  motion.unexport(); // Unexport Button GPIO to free resources
};

process.on('SIGINT', unexportOnClose); //function to run when user closes using ctrl+c
