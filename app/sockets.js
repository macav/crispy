module.exports = function(server) {
  var io = require('socket.io')(server);

  io.on('connection', function(socket) {
    socket.on('login', function(username) {
      socket.username = username;
      console.log('we have login from %s', username);
    });
    socket.on('message', function(message) {
      console.log('we have a message from %s: %s', socket.username, message);
      socket.broadcast.emit('received', {
        username: socket.username,
        message: message,
        time: new Date()
      });
    });
    socket.on('letter', function(letter) {
      console.log('we have a letter from %s: %s', socket.username, letter);
      socket.broadcast.emit('letterreceived', {
        username: socket.username,
        message: letter,
        time: new Date()
      });
    });
    socket.on('reconnect', function() {
      console.log('user reconnected with id '+socket.id, socket.username);
    });
    socket.on('disconnect', function() {
      if (socket.username) {
        console.log('we have logout from %s', socket.username);
        delete socket.username;
      }
    });
  });
}