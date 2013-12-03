var mongoose = require('mongoose'),
passport = require('passport'),
bcrypt = require('bcrypt'),
Schema = mongoose.Schema,
SALT_WORK_FACTOR = 10;



/***********Basic UserSchema**/

var userSchema = Schema({
	email: {type:String, required: true, unique: true },
	password: {type: String, required: true},

	name:{
		first: {type:String, required: true},
		middle: String,
		last: {type:String, required: true}
	},
	admin: {type:Boolean, default: false},
	birthday: Date,
	nrNum: Number,
	
});

// Bcrypt middleware
// Bcrypt ensures 
// Used to encrypt tha passwords before saving a user object into the database
userSchema.pre('save', function(next) {
	//assign the user
	// Variable 'this' is associated to the user this applied to
	var user = this;
	// Check if the password is modified(already encrypted) if it's not modified turn to the next statement
	if(!user.isModified('password')) return next();
	
	// Encrypts the password using salt encryption
	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
	
	// Checks for an error if there
	if(err) return next(err);
	bcrypt.hash(user.password, salt, function(err, hash) {
			if(err) return next(err);
			user.password = hash;
			next();
		});
	});
});


// Password verification
userSchema.methods.comparePassword = function(candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
		if(err) return cb(err);
		cb(null, isMatch);
	});
};


console.log("It Works, so far!!!");
module.exports = mongoose.model('User', userSchema);