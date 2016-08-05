var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var bcrypt = require('bcryptjs');

// Connect to database
// Since we're using multiple connections must use createConnection
var db = mongoose.createConnection('mongodb://'+process.env.MLABDB_SAMBLOG_USER+':'+process.env.MLABDB_SAMBLOG_PASS+'@ds017175.mlab.com:17175/samsblog');


var UserSchema = mongoose.Schema({
	name: {
		type: String
	},
	email: {
		type: String
	},
	username: {
		type: String,
		index: true,
	},
	usernameLowerCase: {
		type: String,
	},
	password: {
		type: String,
	},
	avatar: {
		type: String
	},
	providerId : {
		type: String
	},
	provider : {
		type: String, default: 'local'
	},
	socialMediaProfilePhoto: {
		type: String
	},
	suspended: {
		type: Boolean, default: false
	},
})


UserSchema.plugin(mongoosePaginate);

// Here we convert our schema into a model. We give it a name('User') and point at which schema(UserSchema)
var User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	User.findOne(query, callback);
}

// bcrypt compare returns true or false as the response (in this case isMatch is the reponse!)
module.exports.comparePassword = function(candidatePassword, hash, callback){
	// Use bcrypt compare
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
		callback(null, isMatch);
	});
} 

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
			// newUser is what we want to hash
			bcrypt.hash(newUser.password, salt, function(err, hash) {
				// Hashing the password
				newUser.password = hash;
				// Saving the hashed password (.save is mongoose function)
				newUser.save(callback); 
			});
		});
}
