var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var clients = io.sockets.clients();

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    socket.on('pointers', function(msg){
        socket.broadcast.emit('pointers', msg);
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});