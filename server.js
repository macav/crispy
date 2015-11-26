// server.js

// modules =================================================
var express        = require('express');
var mongoose       = require('mongoose');
var app            = express();
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var server 		   = require('http').createServer(app);
var passport       = require('passport');

// configuration ===========================================
    
// config files
var db = require('./config/db');

// set our port
var port = process.env.PORT || 8001; 

// connect to our mongoDB database 
// (uncomment after you enter in your own credentials in config/db.js)
mongoose.connect(db.url); 

// get all data/stuff of the body (POST) parameters
// parse application/json 
app.use(bodyParser.json()); 

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true })); 

// passport configuration
app.use(passport.initialize());
require('./app/auth/strategies')(passport);

// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override')); 

// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/public')); 

var io = require('./app/sockets')(server); // configure our socket server  
app.set('io', io);

var router = express.Router();
// routes ==================================================
require('./app/routes')(app, router); // configure our routes
app.use('/api', router);
require('./app/auth/routes')(app);

// start app ===============================================
// startup our app at http://localhost:8080
server.listen(port, function() {
  console.log('Server is listening on port', server.address().port);
});

// expose app           
exports = module.exports = app;