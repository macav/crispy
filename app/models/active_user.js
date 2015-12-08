var mongoose = require('mongoose');

var ActiveUserSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    loggedIn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActiveUser', ActiveUserSchema);
