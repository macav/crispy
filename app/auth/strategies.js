var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var LocalStrategy    = require('passport-local').Strategy;
var User           = require('../models/user');
var jwt            = require('jsonwebtoken');
var jwtConfig      = require('../../config/jwt.js');

module.exports = function(passport) {
    passport.use(new GoogleStrategy({
        clientID: '202511624233-8s38iqin9lu9v0oqeqalglcm28e69dk0.apps.googleusercontent.com',
        clientSecret: 'Uyfhte5oAvi67KZ3guw4iHfz',
        callbackURL: 'http://localhost:8000/auth/google/callback'
      }, function(accessToken, refreshToken, profile, done) {
        process.nextTick(function() {
            User.findOne({googleId: profile.id},function(err,user) {
                if (!user) {
                    user = new User();
                    user.last_name = profile.name.familyName;
                    user.first_name = profile.name.givenName;
                    var email;
                    for (var i = 0; i < profile._json.emails.length; i++) {
                        if (profile._json.emails[i].type === 'account')
                            email = profile._json.emails[i].value;
                    }
                    user.email = email;
                    user.googleId = profile.id;
                    user.token = accessToken;
                    user.save(function(err, user) {
                        if (err) {
                            console.log('error saving user', err);
                        }
                    });
                } else {
                    user.token = accessToken;
                    user.save(function(err,user,num) {
                        if(err) {
                            console.log('error saving token');
                        }
                    });
                }
                var token = jwt.sign({userId: user._id, email: user.email}, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
                return done(null, token);
            });
        });
    }));
    passport.use(new FacebookStrategy({
        clientID: '1707430009485972',
        clientSecret: 'c317fe52d12d8d983e8025fe793e18c6',
        callbackURL: 'http://localhost:8000/auth/facebook/callback',
        profileFields: ["id", "birthday", "email", "first_name", "gender", "last_name"]
      }, function(accessToken, refreshToken, profile, done) {
        process.nextTick(function() {
            User.findOne({facebookId: profile.id},function(err,user) {
                if (!user) {
                    user = new User();
                    user.last_name = profile.name.familyName;
                    user.first_name = profile.name.givenName;
                    if (profile.emails.length) {
                        user.email = profile.emails[0].value;
                    }
                    user.token = accessToken;
                    user.facebookId = profile.id;
                    user.save(function(err, user) {
                        if (err) {
                            process.nextTick(function() {
                                return done(null,user);
                            });
                        }
                    });
                } else {
                    user.token = accessToken;
                    user.save(function(err,user,num) {
                        if(err) {
                            console.log('error saving token');
                        }
                    });
                }
                var token = jwt.sign({userId: user._id, email: user.email}, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
                return done(null, token);
            });
        });
    }));
    passport.use(new LocalStrategy(function(username, password, done) {
        process.nextTick(function() {
            User.findOne({email: username}, function(err, user) {
                if (err) {
                    return done(err, false);
                }
                if (!user) {
                    return done(null, false);
                } else {
                    if (!user.validPassword(password)) {
                        return done(null, false);
                    }
                    var token = jwt.sign({userId: user._id, email: user.email}, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
                    return done(null, token);
                }
            });
        });
    }));
};