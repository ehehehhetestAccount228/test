const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const log = require('simple-node-logger').createSimpleFileLogger('game.log');

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/beep.mp3', (req, res) => {
    res.sendFile(__dirname + '/beep.mp3');
});

io.on('connection', (socket) => {
    io.emit('users', { count: io.sockets.server.eio.clientsCount });
    log.info(`User ${socket.id} connected`);

    // if I add rate limiting, please add logs for rate limiting fails too! (log rate limiting must be also with rate limiting)
    socket.on('point', (msg) => {
        socket.broadcast.emit('point', { x: msg.x, y: msg.y, id: socket.id });
    });

    socket.on('beep', (msg) => {
        log.info(`User ${socket.id} sent "beep" action`);
        socket.broadcast.emit('alert', { });
    });

    socket.on('disconnect', (msg) => {
        log.info(`User ${socket.id} disconnected`);
        socket.broadcast.emit('users', { count: io.sockets.server.eio.clientsCount });
    });
});

http.listen(80, () => {
    console.log('listening on *:80');
});
