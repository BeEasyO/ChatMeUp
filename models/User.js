const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
	email:{
		type: String,
		unique: true,
		sparse: true,
		lowercase: true,
		trim: true,
		//validate: [validator.isEmail, "Invalid email address"],
		//required: "Please Supply an email address"
	},
	name:{
		type: String,
		//unique: true,
		trim: true,
	},
	resetPasswordToken: String,
	resetPasswordExpires: Date,
	facebook: {
		id: String,
		token: String,
		email: String,
		name: String
	},
	google: {
		id: String,
		token: String,
		email: String,
		name: String
	}
});

 userSchema.virtual('gravatar').get(function(){
// 	//console.log(this);
// 	//const hash = md5(this.email);
// 	//return `https://gravatar.com/avatar/${hash}?s=200`;
 })

 userSchema.plugin(passportLocalMongoose, {usernameField: 'email'});
userSchema.plugin(mongodbErrorHandler)
module.exports = mongoose.model('User', userSchema);