// app/models/nerd.js
// grab the mongoose module
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BearSchema = new Schema({
	name: String
});
// define our nerd model
// module.exports allows us to pass this to other files when it is called
module.exports = mongoose.model('Bear', BearSchema);