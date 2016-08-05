var mongoose = require('mongoose');

// Connect to database
// Since we're using multiple connections must use createConnection
var db = mongoose.createConnection('mongodb://'+process.env.MLABDB_SAMBLOG_USER+':'+process.env.MLABDB_SAMBLOG_PASS+'@ds017175.mlab.com:17175/samsblog');

var Schema = mongoose.Schema;


var CategorySchema = new Schema({
	name: String,
	},
	{collection: 'categories'}
)

// Here we convert our schema into a model. We give it a name('Post') and point at which schema(PostSchema)
var Category = module.exports = mongoose.model('Category', CategorySchema);
