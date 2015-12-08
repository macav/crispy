var User = require('../models/user');
var jwt            = require('jsonwebtoken');
var jwtConfig      = require('../../config/jwt.js');

module.exports = function(app) {
    app.get('/auth/google', function(req, res, next) {
        var passport = req._passport.instance;

        passport.authenticate('google', {scope: 'https://www.googleapis.com/auth/plus.login'}, function(err, user, info) {

        })(req,res,next);
    });
    app.get('/auth/google/callback', function(req, res, next) {
        var passport = req._passport.instance;
        passport.authenticate('google', function(err, token, info) {
            if(err) {
                return next(err);
            }
            if(!token) {
                return res.redirect('http://localhost:8001');
            } else {
                res.writeHead(302, {
                    'Location': 'http://localhost:8001/#/login/callback?token=' + token
                });
                res.end();
            }
        })(req,res,next);
    });
    app.get('/auth/facebook', function(req, res, next) {
        req._passport.instance.authenticate('facebook', {scope: ['public_profile', 'email']}, function(err, user, info) {

        })(req, res, next);
    });
    app.get('/auth/facebook/callback', function(req, res, next) {
        var passport = req._passport.instance;
        passport.authenticate('facebook', function(err, token, info) {
            if(err) {
                return next(err);
            }
            if(!token) {
                return res.redirect('http://localhost:8001');
            } else {
                res.writeHead(302, {
                    'Location': 'http://localhost:8001/#/login/callback?token=' + token
                });
                res.end();
            }
        })(req, res, next);
    });
    app.post('/auth/local', function(req, res, next) {
        req._passport.instance.authenticate('local', function(err, token, user) {
            if (!token) {
                return res.json({success: false, message: 'User not found'});
            }
            require('../utils/parsers')(app).parseActiveUsers(user, function(users) {
              res.json({success: true, user: user.email, userId: user._id, token: token, users: users});
            });
        })(req, res, next);
    });
    app.post('/auth/refresh_token', function(req, res, next) {
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
        jwt.verify(token, jwtConfig.secret, function(err, profile) {
            if (err) {
                return res.status(401).send("Token not valid");
            }
            var refreshed_token = jwt.sign(profile, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
            res.json({token: refreshed_token});
        });
    });
};
