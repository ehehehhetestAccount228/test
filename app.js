var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var clients = io.sockets.clients();

function hashCode(str) { // java String#hashCode
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
       hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
} 

function intToRGB(i){
    var c = (i & 0x00FFFFFF)
        .toString(16)
        .toUpperCase();

    return "00000".substring(0, 6 - c.length) + c;
}

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    var address = socket.handshake.address;
    socket.on('pointers', function(msg){
        socket.broadcast.emit('pointers', {x:msg.x,y:msg.y,hex:intToRGB(hashCode(address))});
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});