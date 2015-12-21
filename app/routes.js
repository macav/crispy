// app/routes.js

// grab the nerd model we just created
var Bear = require('./models/bear');
var User = require('./models/user');
var Message = require('./models/message');
var jwt = require('jsonwebtoken');

    module.exports = function(app, router) {

        router.route('/register')
        .post(function(req, res) {
            var user = new User();
            user.email = req.body.username;
            user.password = user.generateHash(req.body.password);
            user.save(function(err, user) {
                if (err) {
                    res.send(err);
                }
                res.status(201).json(user);
            });
        });
        // authentication middleware
        router.use(function(req, res, next) {
            var token;
            if (req.query.token) {
                token = req.query.token;
            } else {
                token = req.headers.authorization;
                if (token && token.match('JWT')) {
                    token = token.split('JWT ')[1];
                } else {
                    token = null;
                }
            }
            if (!token) {
                return res.status(401).send("User not authenticated");
            }
            jwt.verify(token, require('../config/jwt.js').secret, function(err, decoded) {
                if (err) {
                    return res.status(401).send({success: false, message: err.name === 'TokenExpiredError' ? 'Token expired' : 'User not authenticated'});
                }
                User.findOne({_id: decoded.userId}, function(err, user) {
                  if (err) {
                    console.log("Couldn't find user");
                    return res.status(500, err);
                  }
                  req.user = user;
                  next();
                });
                // console.log('Decoded:', decoded);
            });
        });

        router.route('/bears')
        .post(function(req, res) {
            var bear = new Bear();
            console.log(req.body);
            bear.name = req.body.name;
            console.log(bear);

            bear.save(function(err) {
                if (err)
                    res.send(err);

                res.json(bear);
            })
        })
        .get(function(req, res) {
            Bear.find(function(err, bears) {
                if (err)
                    res.send(err);

                res.json(bears);
            });
        });
        router.route('/bears/:bear_id')
        .get(function(req, res) {
            Bear.findById(req.params.bear_id, function(err, bear) {
                if (err)
                    res.send(err);
                if (bear)
                    res.json(bear);
                else res.status(404).send();
            });
        })
        .put(function(req, res) {
            Bear.findById(req.params.bear_id, function(err, bear) {
                if (err)
                    res.send(err);

                bear.name = req.body.name;

                bear.save(function(err) {
                    if (err)
                        res.send(err);

                    res.json(bear);
                });
            });
        })
        .delete(function(req, res) {
            Bear.remove({
                _id: req.params.bear_id
            }, function(err, bear) {
                if (err)
                    res.send(err);

                res.status(204).send();
            });
        });

        router.route('/messages')
        .post(function(req, res) {
          if (!req.body.message) {
            return res.status(400).json('Neni zadna mesidz');
          }
            var message = new Message();
            message.message = req.body.message;
            message.recipient = req.body.recipient;
            message.user = req.user._id;

            message.save(function(err, message) {
                if (err)
                    res.send(err);

                message.user = req.user;
                var users = app.get('activeUsers');
                for (var i = 0; i < users.length; i++) {
                  if (users[i]._id == req.body.recipient) {
                    users[i].socket.emit('received', message);
                  }
                }
                res.status(201).json(message);
            })
        })
        .get(function(req, res) {
          var ObjectId = require('mongoose').Types.ObjectId;
          var params = {};
          if (req.query.user) {
            params.$and = [{$or: [{recipient: new ObjectId(req.query.user)}, {recipient: new ObjectId(req.user._id)}]}, {$or: [{user: new ObjectId(req.query.user)}, {user: new ObjectId(req.user._id)}]}]
            Message.update({user: req.query.user, recipient: req.user._id}, {read: true}, {multi: true}, function(err, response) {
              if (err) {
                console.log('Cannot set messages as read');
              }
            });
          } else {
            params.$or = [{user: new ObjectId(req.query.user)}, {user: new ObjectId(req.user._id)}];
          }
          Message.find(params).sort({'date': 1}).populate('user').exec(function(err, messages) {
              if (err)
                  res.send(err);

              res.json(messages);
          });
        });

        router.get('/users', function(req, res) {
          require('./utils/parsers')(app).parseActiveUsers(req.user, function(users) {
            res.status(200).json(users);
          });
        });

        router.route('/profile')
        .patch(function(req, res) {
          req.user.status = req.body.status;
          req.user.save(function(err, user) {
            if (err) {
              res.status(500).json({success: false});
            }
            var users = app.get('activeUsers');
            for (var i = 0; i < users.length; i++) {
              if (users[i]._id.equals(req.user._id)) {
                users[i].status = req.user.status;
              } else {
                users[i].socket.emit('statusUpdate', {user: req.user, status: req.user.status});
              }
            }
            res.status(200).json({success: true, status: req.body.status});
          });
        });

        router.get('/', function(req, res) {
            res.json({message: 'hooouraaay: beeaar is coming to getcha!'});
        });

    };
