var mongoose = require('mongoose'),
patients = require('./patient.js'),
Schema = mongoose.Schema;

var hostSchema = Schema({
	pplNum: Number,
	lnglat: [Number],
	patients : [{ type: Schema.Types.ObjectId, ref: 'Patient' }]
	
});

module.exports = mongoose.model('Hospital', hostSchema);