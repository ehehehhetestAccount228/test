const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const log = require('simple-node-logger').createSimpleFileLogger('game.log');
const { RateLimiterMemory } = require('rate-limiter-flexible');

const rateLimiter = new RateLimiterMemory({
    points: 4,
    duration: 1
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/beep.mp3', (req, res) => {
    res.sendFile(__dirname + '/beep.mp3');
});

let points = [];
let now = Date.now();
setInterval(() => {
    if (points.length > 0) {
        io.emit('points', points);
        points = [];
    }
}, 500);

io.on('connection', (socket) => {
    io.emit('users', { count: io.sockets.server.eio.clientsCount });
    log.info(`User ${socket.id} connected`);

    socket.on('points', (data) => {
        rateLimiter.consume(socket.id).then(() => {
            for (let point of data) {
                if (point.delay > 500) point.delay = 500;
                points.push({ x: point.x, y: point.y, id: socket.id, delay: point.delay });
            }
        }).catch(() => {
            log.info(`User ${socket.id} exceeded rate limit`)
        });
    });

    socket.on('beep', (msg) => {
        log.info(`User ${socket.id} sent "beep" action`);
        socket.broadcast.emit('beep', { });
    });

    socket.on('disconnect', (msg) => {
        log.info(`User ${socket.id} disconnected`);
        socket.broadcast.emit('users', { count: io.sockets.server.eio.clientsCount });
    });
});

http.listen(80, () => {
    console.log('listening on *:80');
});
