var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var patientSchema = Schema({
	lname: String ,
	zip: Number,
	lnglat: [Number]
	
	
});

module.exports = mongoose.model('Patient', patientSchema);