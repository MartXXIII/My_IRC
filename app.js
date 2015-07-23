
var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

server.listen(8080);


app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/css/bootstrap.min.css', function(req, res){
    res.sendFile(__dirname + '/css/bootstrap.min.css');
});

app.get('/css/simple-sidebar.css', function(req, res){
    res.sendFile(__dirname + '/css/simple-sidebar.css');
});

app.get('/js/jquery.js', function(req, res){
    res.sendFile(__dirname + '/js/jquery.js');
});

app.get('/js/bootstrap.min.js', function(req, res){
    res.sendFile(__dirname + '/js/bootstrap.min.js');
});

app.get('/script.js', function(req, res){
    res.sendFile(__dirname + '/script.js');
});


// rooms
var rooms = ['HOME','ROOM 1','ROOM 2'];

var usernames = [];

//broadcast pour tous les autres utlisateurs
//io.sockets.emit pour TOUS les utilisateurs
io.sockets.on('connection', function (socket) {
	

	socket.on('adduser', function(username){

		socket.username = username;

		socket.room = 'HOME';

		usernames[username] = username;

		socket.join('HOME');

		socket.emit('updatechat', 'GLOBAL', 'Vous êtes connecté sur la HOME');

		socket.broadcast.to('HOME').emit('updatechat', 'GLOBAL', username + " s'est connecté sur la room");
		socket.emit('updaterooms', rooms, 'HOME');
	});


	socket.on('sendchat', function (data) {

		io.sockets.in(socket.room).emit('updatechat', socket.username, data);
	});

    //switch room
	socket.on('switchRoom', function(newroom){
		socket.leave(socket.room);
		socket.join(newroom);
		socket.emit('updatechat', 'CMD', 'Vous êtes connecté sur la '+ newroom);

		socket.broadcast.to(socket.room).emit('updatechat', 'GLOBAL', socket.username+' a quitté la room');

		socket.room = newroom;
		socket.broadcast.to(newroom).emit('updatechat', 'GLOBAL', socket.username+' a rejoint la room');
		socket.emit('updaterooms', rooms, newroom);
	});

    socket.on('changeName', function(newname){
        socket.emit('updatechat', 'CMD' , socket.username + " a changé son pseudo pour " + "'"+ newname + "'");
        delete usernames[socket.username];
        socket.username = newname;
        usernames[newname] = newname;
    });

    socket.on('listRooms', function(){
       socket.emit('updatechat', 'CMD' , rooms , 'liste' );
    });

    socket.on('leaveRoom', function(){
        socket.leave(socket.room);
        socket.join('HOME');
        socket.emit('updatechat', 'CMD', 'Vous êtes connecté sur la '+ 'HOME');

        socket.broadcast.to(socket.room).emit('updatechat', 'GLOBAL', socket.username+' a quitté la room');

        socket.room = 'HOME';
        socket.broadcast.to('HOME').emit('updatechat', 'GLOBAL', socket.username+' a rejoint la room');
        socket.emit('updaterooms', rooms, 'HOME');
    });

    socket.on('listUsers', function(){
        console.log(socket.room);
        for (var k in usernames){
            if (usernames.hasOwnProperty(k)) {
                socket.emit('updatechat', 'GLOBAL', usernames[k])
            }
        }
    });

    socket.on('sendMessage', function(data){
        console.log(data);
        io.sockets.in(socket.room).emit('updatechat', socket.username, data)
    });


	// disconnect
	socket.on('disconnect', function(){

		delete usernames[socket.username];

		io.sockets.emit('updateusers', usernames);

		socket.broadcast.emit('updatechat', 'GLOBAL', socket.username + " s'est déconnecté");
		socket.leave(socket.room);
	});
});
