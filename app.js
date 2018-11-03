var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var clients = io.sockets.clients();

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    let clientCount = io.engine.clientsCount;

    socket.broadcast.emit('users', { count: clientCount })

    socket.on('pointers', function (msg) {
        socket.broadcast.emit('pointers', { x: msg.x, y: msg.y, hex: socket.id });
    });
    socket.on('disconnect', function (msg) {
        socket.broadcast.emit('users', { count: clientCount });
    });
});

http.listen(80, function () {
    console.log('listening on *:80');
});
