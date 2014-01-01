var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var doctorSchema = Schema({
	profession: String,
	RVU: Number,
	estimatedRVU: Number
	
});

module.exports = mongoose.model('Physician', doctorSchema);