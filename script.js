var socket = io.connect('http://localhost:8080');


socket.on('connect', function(){
    socket.emit('adduser', prompt("Pseudo!"));
});

// chat function
socket.on('updatechat', function (username, data) {
    $('#conversation').append('<b>'+username + ':</b> ' + data + '<br>');
});

// rooms function
socket.on('updaterooms', function(rooms, current_room) {
    $('#rooms').empty();
    $.each(rooms, function(key, value) {
        if(value == current_room){
            $('#rooms').append('<div>' + value + '</div>');

        } else {
            $('#rooms').append('<div><a href="#" onclick="switchRoom(\''+value+'\')">' + value + '</a></div>');

        }
    });
});


function switchRoom(room){
    socket.emit('switchRoom', room);
}

function chat_command_slash(cmd, arg) {
    switch (cmd) {

        case 'username':
            socket.emit('changeName', arg);
            break;

        case 'list':
            socket.emit('listRooms');
            break;

        case 'join':
            socket.emit('switchRoom', arg);
            break;

        case 'leave':
            socket.emit('leaveRoom');
            break;

        case 'users':
            socket.emit('listUsers');
            break;

        default:
            console.log("Mauvaise commande");

    }
}

function chat_command_underscore(cmd, arg){
    switch(cmd) {

        case 'message':
            console.log('working');
            socket.emit('sendMessage', arg);
            break;

        default:
            console.log('Mauvaise commande');
    }
}

$(function(){
    $('#datasend').click(function(line) {

        line = $('#data').val();
        var cmd = line.match(/[a-z]+\b/)[0];
        var arg = line.substr(cmd.length + 2, line.length);
        if (line[0] == "/" && line.length > 1) {
            chat_command_slash(cmd, arg);

        } else if (line[0] == "_" && cmd.slice(-1) == "_") {
                console.log(cmd);
                chat_command_underscore(cmd, arg);

        } else {
            var message = $('#data').val();
            $('#data').val('');
            socket.emit('sendchat', message);
        }
    });

    // ENTER
    $('#data').keypress(function(e) {
        if(e.which == 13) {
            $(this).blur();
            $('#datasend').focus().click();
        }
    });

});

