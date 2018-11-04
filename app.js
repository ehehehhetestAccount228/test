var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const log = require('simple-node-logger').createSimpleFileLogger('game.log');

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/getUsersCount', function (req, res) {
    res.json({count: io.sockets.server.eio.clientsCount})
});

app.get('/beep.mp3', (req,res)=>{
    res.sendFile(__dirname + '/beep.mp3');
})

io.on('connection', function (socket) {
    socket.broadcast.emit('users', { count: io.sockets.server.eio.clientsCount });
    log.info(`New user ${socket.id} has been connected`);

    // if I add rate limiting, please add logs for rate limiting fails too! (log rate limitting must be also with rate limiting)
    socket.on('pointers', function (msg) {
        socket.broadcast.emit('pointers', { x: msg.x, y: msg.y, hex: socket.id });
    });
    socket.on('alert', function (msg) {
        log.info(`User ${socket.id} did the Beep action`);
        socket.broadcast.emit('alert', { });
    });
    socket.on('disconnect', function (msg) {
        log.info(`User ${socket.id} has been disconnected`);
        socket.broadcast.emit('users', { count: io.sockets.server.eio.clientsCount });
    });
});

http.listen(80, function () {
    console.log('listening on *:80');
});
