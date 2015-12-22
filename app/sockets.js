var User = require('./models/user');
var Message = require('./models/message');
var ActiveUser = require('./models/active_user');
var utils = require('./utils/utils')();

module.exports = function(app, server) {
  var io = require('socket.io')(server);

  io.on('connection', function(socket) {
    socket.on('login', function(username) {
      User.findOne({_id: username}, function(err, user) {
        if (err) {
          console.log('There was an error when finding the logged in user');
        }
        socket.user = user;
        user.socket = socket;
        var activeUsers = app.get('activeUsers');
        var existingUser;
        if ( (existingUser = utils.findById(activeUsers, user._id)) !== null) {
          existingUser.socket.emit('forceLogout');
          existingUser.socket.disconnect();
          activeUsers.splice(activeUsers.indexOf(existingUser), 1);
        }
        app.get('activeUsers').push(user);

        function emitUserLogin(activeUser) {
          Message.find({user: user._id, recipient: activeUser._id, read: false}, function(err, msgs) {
            var o = user.toObject();
            if (msgs.length) {
              o.unread = msgs.length;
            }
            activeUser.socket.emit('userLogin', o);
          });
        }

        for (var i = 0; i < activeUsers.length; i++) {
          if (!activeUsers[i]._id.equals(user._id)) {
            emitUserLogin(activeUsers[i]);
          }
        }
        ActiveUser.remove({user: user._id}, function(err, deletedUser) {
          if (err) {
            console.log('Login error: ', err);
          }
          var activeUser = new ActiveUser({
            user: user._id
          });
          activeUser.save(function(err, user) {
            if (err) {
              console.log('Cannot save active user!');
            }
          });
        });
        console.log('we have login from %s (%s)', user.email, user._id);
      });
    });
    socket.on('letter', function(data) {
      var users = app.get('activeUsers');
      for (var i = 0; i < users.length; i++) {
        if (users[i]._id == data.recipient) {
          users[i].socket.emit('letterreceived', {
            user: socket.user,
            message: data.message,
            recipient: data.recipient,
            date: new Date()
          });
        }
      }
    });
    socket.on('reconnect', function() {
      console.log('user reconnected with id '+socket.id, socket.user._id);
    });
    socket.on('disconnect', function() {
      if (socket.user) {
        console.log('we have logout from %s', socket.user._id);
        socket.broadcast.emit('userLogout', socket.user);
        ActiveUser.remove({user: socket.user._id}, function(err, user) {
          if (err) {
            console.log('Logout error: ', err);
          }
        });
        var idx;
        var activeUsers = app.get('activeUsers');
        if ( (idx = activeUsers.indexOf(socket.user)) !== -1) {
            activeUsers.splice(idx, 1);
        }
        delete socket.user;
      }
    });
  });
  return io;
}
