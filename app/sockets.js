var User = require('./models/user');

module.exports = function(server) {
  var io = require('socket.io')(server);

  io.on('connection', function(socket) {
    socket.on('login', function(username) {
      User.findOne({_id: username}, function(err, user) {
        if (err) {
          console.log('There was an error when finding the logged in user');
        }
        socket.user = user;
        console.log('we have login from %s (%s)', user.email, user._id);
      });
    });
    socket.on('message', function(message) {
      console.log('we have a message from %s: %s', socket.user._id, message);
      socket.broadcast.emit('received', {
        user: socket.user._id,
        message: message,
        date: new Date()
      });
    });
    socket.on('letter', function(letter) {
      console.log('we have a letter from %s: %s', socket.user._id, letter);
      socket.broadcast.emit('letterreceived', {
        user: socket.user,
        message: letter,
        date: new Date()
      });
    });
    socket.on('reconnect', function() {
      console.log('user reconnected with id '+socket.id, socket.user._id);
    });
    socket.on('disconnect', function() {
      if (socket.user) {
        console.log('we have logout from %s', socket.user._id);
        delete socket.user;
      }
    });
  });
  return io;
}