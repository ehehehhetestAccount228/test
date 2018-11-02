var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var clients = io.sockets.clients();

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    socket.broadcast.emit('users', {count: io.engine.clientsCount});

    socket.on('pointers', function(msg){
        socket.send(socket.id);
        socket.broadcast.emit('pointers', {x:msg.x,y:msg.y,hex:socket.id});
    });
    socket.on('disconnect', function(msg) {
        socket.broadcast.emit('users', {count: io.engine.clientsCount});
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});