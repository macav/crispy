// app/routes.js

// grab the nerd model we just created
var Bear = require('./models/bear');
var User = require('./models/user');
var jwt = require('jsonwebtoken');

    module.exports = function(router) {

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
                req.user = decoded;
                console.log('Decoded:', decoded);
                next();
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

        router.get('/', function(req, res) {
            res.json({message: 'hooouraaay: beeaar is coming to getcha!'});
        });

    };