var socket = io('http://10.85.8.62:5000');

socket.on('example-pong', function (data) {
    console.log("pong");
});


socket.on('motion', function (data) {
	console.log("motion");
});
window.addEventListener("load", function(){

  var button = document.getElementById('hello');

  button.addEventListener('click', function() {
      console.log("ping");
      socket.emit('example-ping', { duration: 2 });
  });

});
