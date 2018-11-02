var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var clients = io.sockets.clients();
var { RateLimiterMemory } = require('rate-limiter-flexible');
ipfilter = require('ipfilter')
var ips = [];

const rateLimiter = new RateLimiterMemory(
{
      points: 65, // 5 points
      duration: 1, // per second
});

app.use(ipfilter(ips, {mode: 'block'}));
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    socket.broadcast.emit('users', {count: io.engine.clientsCount});

    socket.on('pointers', function(msg){
        rateLimiter.consume(socket.handshake.address).then(() => {
            socket.broadcast.emit('pointers', {x:msg.x,y:msg.y,hex:socket.id});
        }).catch((rejRes) => {
            // When rate limitations is exteed ban IP (add to banned IP array). Yes. just Permanent. ban.!
            ips.push(socket.handshake.address)
          });
    });
    socket.on('disconnect', function(msg) {
        socket.broadcast.emit('users', {count: io.engine.clientsCount});
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});