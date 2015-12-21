var jwt = require('jsonwebtoken');
var jwtConfig      = require('./config/jwt.js');

console.log(jwt.sign({userId: 12345, email: 'test1'}, jwtConfig.secret, {expiresIn: jwtConfig.expiresIn}));
