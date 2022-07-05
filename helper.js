var _ = require('lodash');
var async = require('async');
var config = require('./config');
var jwt = require('jsonwebtoken');

module.exports = {
    //error message
    _errorResponse: function (err) {
        var json = {};
        json['statusCode'] = 500;
        json['message'] = err;
        console.log(json);
        return json;
    },
    //success message
    _successResponse: function (msg) {
        var json = {};
        json['statusCode'] = 200;
        json['message'] = msg;
        return json;
    },

    //jwt token generator
    _jwtTokengenerter: function (argument) {
        var token = jwt.sign(argument, config.jwtprivateKey);
        return token;
        // body...
    },

    //jwt token generator
    _jwtTokendecoder: function (token) {
       try{
        var decoded = jwt.verify(token,config.jwtprivateKey);
        return decoded;
       }catch{
        return false;
       }
        // body...
    }

}