var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var patientSchema = Schema({
	lname: String ,
	address: String,
	gender: String,
	age: Number,
	ethnicity: String,
	lnglat: []
	
	
});

module.exports = mongoose.model('Patient', patientSchema);