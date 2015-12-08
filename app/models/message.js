var mongoose = require('mongoose');

var MessageSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    message: {type: String, required: true},
    date: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
});

module.exports = mongoose.model('Message', MessageSchema);
