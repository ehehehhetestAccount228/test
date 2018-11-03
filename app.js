var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/getUsersCount', function (req, res) {
    res.json({count: io.sockets.server.eio.clientsCount})
});

io.on('connection', function (socket) {
    socket.broadcast.emit('users', { count: io.sockets.server.eio.clientsCount });

    socket.on('pointers', function (msg) {
        socket.broadcast.emit('pointers', { x: msg.x, y: msg.y, hex: socket.id });
    });
    socket.on('alert', function (msg) {
        socket.broadcast.emit('alert', { });
    });
    socket.on('disconnect', function (msg) {
        socket.broadcast.emit('users', { count: io.sockets.server.eio.clientsCount });
    });
});

http.listen(80, function () {
    console.log('listening on *:80');
});
