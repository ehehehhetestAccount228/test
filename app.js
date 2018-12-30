const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const log = require('simple-node-logger').createSimpleFileLogger('game.log');
const { RateLimiterMemory } = require('rate-limiter-flexible');
var fs = require("fs");
const { createCanvas, loadImage } = require('canvas')
const canvas = createCanvas(1600, 920)
const ctx = canvas.getContext('2d')
var imgur = require('imgur');

imgur.setCredentials('Imgur_login', 'Imgur_password', 'Imgur_Client ID'); // Login, password, client code
ctx.strokeStyle = 'rgb(200,0,0)'

const rateLimiter = new RateLimiterMemory({
    points: 4,
    duration: 1
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/TiledCanvas.js', (req, res) => {
    res.sendFile(__dirname + '/TiledCanvas.js');
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
                ctx.fillStyle = "#"+toHex(socket.id);
                ctx.beginPath();
                ctx.arc(point.x, point.y, 4, 0, Math.PI*2, false)
                ctx.fill()
                points.push({ x: point.x, y: point.y, id: socket.id, delay: point.delay });
            }
            ctx.save();
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

http.listen(8080, () => {
    console.log('listening on *:8080');
});

setInterval(function (){
    fs.writeFileSync("test.png", canvas.toBuffer())
    imgur.uploadFile('test.png','Y3Xfcvp')
    ctx.clearRect(0, 0, 1600, 920)
}, 60*5) // Do every 5 minutes

function toHex(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  var c = (hash & 0x00FFFFFF).toString(16);
  return "00000".substring(0, 6 - c.length) + c;
}
