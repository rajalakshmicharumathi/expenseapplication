'use strict';

var mongoose = require('mongoose');
mongoose.Promise = Promise;
var Schema = mongoose.Schema;

// User Schema
var UserSchema = new Schema({
	name: {
        type : String
    },
	email: {
		type : String
    },
	phone: {
        type : Number
    },
    otp:{
    	type:Number
    },
    amount:{
        type:Number
    }
});

var UserModel = mongoose.model('user', UserSchema);
module.exports = UserModel;