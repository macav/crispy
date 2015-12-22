var Message = require('../models/message');

module.exports = function(app) {
  return {
    parseActiveUsers: function(user, callback) {
      if (!user) {
        return;
      }
      var filtered = [];
      var active = app.get('activeUsers');
      Message.find({recipient: user._id, read: false}, function(err, msgs) {
        var unreadMsgs = {};
        for (var i = 0; i < msgs.length; i++) {
          if (unreadMsgs[msgs[i].user.toString()] === undefined) {
            unreadMsgs[msgs[i].user.toString()] = 1;
          } else {
            unreadMsgs[msgs[i].user.toString()]++;
          }
        }
        for (var i = 0; i < active.length; i++) {
          if (!active[i]._id.equals(user._id)) {
            var o = active[i].toObject();
            if (unreadMsgs[o._id]) {
              o.unread = unreadMsgs[active[i]._id.toString()];
            }
            filtered.push(o);
          }
        }
        callback(filtered);
      });
    }
  }
};
