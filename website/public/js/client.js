var socket = io('http://10.85.8.62:5000');

socket.on('example-pong', function (data) {
    console.log("pong");
});


socket.on('inside', function (data) {
	console.log("inside motion");
});

socket.on('outside', function (data) {
        console.log("outside motion");
});

socket.on('goingInside', function (data) {
        console.log("Chicken Entered");
	Event2();
});

socket.on('goingOutside', function (data) {
        console.log("Chicken Left");
	Event1();
});

$(function() {

  var button = document.getElementById('hello');

  button.addEventListener('click', function() {
      console.log("ping");
      socket.emit('example-ping', { duration: 2 });
  });

});
