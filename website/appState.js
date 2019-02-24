var app = require('http').createServer(handler)
var io = require('socket.io')(app)
var url = require('url')
var fs = require('fs')
var Gpio = require('onoff').Gpio;
var inside = new Gpio(27, 'in',  'both');
var outside=new Gpio(22,'in','both');

var exitingState=0
var entranceState=0
var fpath = require('path');
var insideState=false;
var outsideState=false;
//This will open a server at localhost:5000. Navigate to this in your browser.
app.listen(5000);

// Http handler function
function handler (req, res) {

    // Using URL to parse the requested URL
    var path = url.parse(req.url).pathname;

    // Managing the root route
    if (path == '/') {
        index = fs.readFile(__dirname+'/public/index.html',
            function(error,data) {

                if (error) {
                    res.writeHead(500);
                    return res.end("Error: unable to load index.html");
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
	var extname = fpath.extname(path);
    var contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;      
        case '.jpg':
            contentType = 'image/jpg';
            break;
        case '.wav':
            contentType = 'audio/wav';
            break;
    }
	fs.readFile(__dirname+'/public/'+path, function(error, content) {
        if (error) {
            if(error.code == 'ENOENT'){
                fs.readFile('./404.html', function(error, content) {
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(content, 'utf-8');
                });
            }
            else {
                res.writeHead(500);
                res.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
                res.end(); 
            }
        }
        else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
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
inside.watch(function (err, value) {
	if(err) {
		console.error('There was an error', err);
	}
	else
	{
	console.log(value)
//		if(value==1) {
			if(!insideState) {
				console.log('motion !');
				io.sockets.emit('inside');
				insideState=true;
				switch(exitingState)
				{
					case 0:
						exitingState=1;
						break;
					case 1:
						break;
					
				}
				switch(entranceState)
				{
					case 1:
					entranceState=2;
					break;	
				}
//				
		}
		else
		{
//			if(insideState=true)
//			{
				insideState=false;
				switch(exitingState)
				{
					case 1:
						exitingState=0;
						break;
					case 2:
						exitingState=3;
						break;
				}
				switch(entranceState)
				{
					case 1:
						entranceState=0;
						break;
					case 4:
						io.sockets.emit('goingInside');
						entranceState=0;
						break;
				}
			}
//		}
	}
});

outside.watch(function (err, value) {
        if(err) {
                console.error('There was an error', err);
        }
        else
        {
        console.log(value)
  //              if(value==1) {
                        if(!outsideState) {
                                console.log('motion !');
                                io.sockets.emit('outside');
			switch(entranceState)
                                {
                                        case 0:
                                                entranceState=1;
                                                break;
                                        case 1:
                                                break;

                                }
                                switch(exitingState)
                                {
                                        case 1:
                                        exitingState=2;
                                        break;  
                                }
    //                    }
                }
                else
                {
      //                  if(outsideState=true)
      //                  {
                                outsideState=false;
				switch(entranceState)
                                {
                                        case 1:
                                                entranceState=0;
                                                break;
                                        case 2:
                                                entranceState=3;
                                                break;
                                }
                                switch(exitingState)
                                {
                                        case 1:
                                                exitingState=0;
                                                break;
                                        case 4:
                                                io.sockets.emit('goingOutside');
                                                exitingeState=0;
                                                break;
                                }
 //                       }
                }
        }
});

function unexportOnClose() { //function to run when exiting program
//  LED.writeSync(0); // Turn LED off
//  LED.unexport(); // Unexport LED GPIO to free resources
  inside.unexport(); // Unexport Button GPIO to free resources
};

process.on('SIGINT', unexportOnClose); //function to run when user closes using ctrl+c
