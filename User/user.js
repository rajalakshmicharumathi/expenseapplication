var _ = require('lodash');
var async = require('async');
var config = require('../config');
var helper = require('../helper');
var dbConfig = require('../dbConfig');
var userModel = require('./user.model');
var ObjectId = require('mongoose').Types.ObjectId;
var mongoose = require('mongoose');
var _ = require('lodash');

let dbConnection;
let client;

dbConfig.dbConnection(config.url, config.dbName)
	.then(connectionDetails => {
	    console.log("connection succeed");
	    dbConnection = connectionDetails.db;
	    client = connectionDetails.client;
	    
	})
	.catch(err => {
	    console.log(" DB ERROR-->", err);
	});


//Function for user signup process
exports.userCreation = function (req, callback) {
	var json={};
	console.log(req,'email');
	if (req.email == undefined || req.email == '') {
        return callback(helper._errorResponse('Invalid Email Id'));
    } else if(req.name == undefined || req.name =='') {
        return callback(helper._errorResponse('Invalid Name'));
    } else if(req.phone == undefined || req.phone == ''){
    	return callback(helper._errorResponse('Invalid Mobile Number'));	
    }
    var insertQry={
    	"name":req.name,
    	"email":req.email,
		"phone":req.phone,
		"amount":0

    }
    var findQry = {
    	"phone":req.phone
    }
  	_findUser(findQry,function(userStatus,userDetail){
        	if(userStatus){
        		return callback(helper._errorResponse('Mobile Number already exist'));	
        	}else{
        		_insertUser(insertQry,function(insertStatus){
        			return callback(insertStatus);
        		})

        	}
    })
        
	
}


//Api to generate random otp
exports.generateOtp = function (req, callback) {
	var json={};
	console.log(req,'email');
	if(req.phone == undefined || req.phone == ''){
    	return callback(helper._errorResponse('Invalid Mobile Number'));	
    }
   	var findQry = {
    	"phone":req.phone
    }
   	var otp = Math.floor(1000 + Math.random() * 9000);
    var updateQry = {
    	"phone":req.phone
    }
    var updateObj = {
    	"otp":otp

    }
	_findUser(findQry,function(userStatus,userDetails){
		if(userStatus){
				_updateUser(updateObj,updateQry,function(updateStatus){
				    var json = updateStatus
	                json.otp = otp;
	                return callback(json);
            	})
		}else{
			return callback(helper._errorResponse('User does not exist'));	
		}
	})
   
	
}

//Login api to generate jwt token
exports.login = function (req, callback) {
	if(req.phone == undefined || req.phone == ''){
    	return callback(helper._errorResponse('Invalid Mobile Number'));	
    }

    if(req.otp == undefined || req.otp == ''){
    	return callback(helper._errorResponse('Invalid Otp'));	
    }
   	var findQry = {
    	"phone":req.phone,
    	"otp":parseInt(req.otp)
    }
    _findUser(findQry,function(otpStatus,userDetails){
    	if(otpStatus){
    		var updateObj = {
    			"otp":Math.floor(1000 + Math.random() * 9000)
    		}
    		var updateQry = {
    			"phone":req.phone
    		}
    		_updateUser(updateObj,updateQry,function(updateStatus){
    			console.log(userDetails);
    			var token = helper._jwtTokengenerter(userDetails[0]);
    			var json = helper._successResponse("Valid Otp");
    			json.token = token;
    			return callback(json);
    		});
	   		
    	}else{
    		return callback(helper._errorResponse("Invalid Otp"));
    	}


    });

}


//get user details
exports.getUser = function (req, callback) {
	console.log(req.headers,'sdsd');

	var token = req.headers.token?req.headers.token:undefined;
	if(token==undefined||token==''){
		return callback(helper._errorResponse('Invalid Token'));	
	}else if(!helper._jwtTokendecoder(token)){
		return callback(helper._errorResponse('Invalid JWT Token'));	
	}else if(req.query.userId==undefined||req.query.userId==''){
		return callback(helper._errorResponse('Invalid userId'));	
	}else if(!mongoose.Types.ObjectId.isValid(req.query.userId)){
		return callback(helper._errorResponse('Invalid userId'));	
	}
	var userId = req.query.userId;
	var findQry = {
    	"_id":new ObjectId(userId),
    }
    console.log(findQry);
    _findUser(findQry,function(userStatus,userDetails){
    	if(userStatus){
    		var json = helper._successResponse("User listed Successfully");
    		json.userDetails = userDetails;
    		return callback(json);
    	}else{
    		return callback(helper._errorResponse('Invalid userId'));	
    	}
    })

}

//get all user details
exports.getallUser = function (req, callback) {

	var token = req.headers.token?req.headers.token:undefined;
	if(token==undefined||token==''){
		return callback(helper._errorResponse('Invalid Token'));	
	}else if(!helper._jwtTokendecoder(token)){
		return callback(helper._errorResponse('Invalid JWT Token'));	
	}
	var findQry = {
    	"amount":{$gt: 0}
    }
    console.log(findQry);
    _findUser(findQry,function(userStatus,userDetails){
    	if(userStatus){
    		var json = helper._successResponse("User listed Successfully");
    		json.userDetails = userDetails;
    		return callback(json);
    	}else{
    		return callback(helper._errorResponse('No more result'));	
    	}
    })

}

//amount share api
exports.share = function(req,callback){
	var token = req.headers.token?req.headers.token:undefined;
	if(token==undefined||token==''){
		return callback(helper._errorResponse('Invalid Token'));	
	}else if(!helper._jwtTokendecoder(token)){
		return callback(helper._errorResponse('Invalid JWT Token'));	
	}
	else if(req.body.SharingUserId==undefined||req.body.SharingUserId==''){
		return callback(helper._errorResponse('Invalid SharingUserId'));	
	}
	else if(req.body.Expense==undefined||req.body.Expense==''){
		return callback(helper._errorResponse('Invalid Expense'));	
	}
	else if(req.body.Expense!='EXACT'&&req.body.Expense!='EQUAL'&&req.body.Expense!='PERCENTAGE'){
		return callback(helper._errorResponse('Invalid Expense Type it should be EQUAL,EXACT or PERCENTAGE'));	
	}
	else if(req.body.Amount==undefined||req.body.Amount==''){
		return callback(helper._errorResponse('Invalid Amount'));	
	}
	else if(req.body.Amount!=parseFloat(req.body.Amount).toFixed( 2 )){
		return callback(helper._errorResponse('Given amount should be decimal upto 2 places'));	
	}
	else if(req.body.Expense=='EXACT'&&req.body.ExactAmount==undefined||req.body.ExactAmount==''){
		return callback(helper._errorResponse('Invalid Exact Amount'));	
	}
	else if(req.body.Expense=='PERCENTAGE'&&req.body.Percentage==undefined||req.body.Percentage==''){
		return callback(helper._errorResponse('Invalid Percentage'));	
	}

	if(req.body.Expense=='EQUAL'){
		_shareEqual(req,function(err,equalRes){
			if(err){
				return callback(helper._errorResponse(err));	
			}else{
				return callback(helper._successResponse(equalRes));
			}		
		})
	}

	if(req.body.Expense=='EXACT'){
		_shareExact(req,function(err,exactRes){
			if(err){
				return callback(helper._errorResponse(err));	
			}else{
				return callback(helper._successResponse(exactRes));
			}
			
		})
	}

	if(req.body.Expense=='PERCENTAGE'){
		_sharePercentage(req,function(err,percentageRes){
			if(err){
				return callback(helper._errorResponse(err));	
			}else{
				return callback(helper._successResponse(percentageRes));
			}
			
		})
	}
	


}

//Logic to share amount equally
_shareEqual = function (req,callback) {
	var userId = req.body.SharingUserId.split(",");
	var userLength = userId.length;
	var amount = req.body.Amount;
	amount = parseInt(amount);
	const num = amount;
	const parts = userLength;

	//main logic to find equal share details
	const splitNumber = (num, parts) => {
	   let n = Math.floor(num / parts);
	   const arr = [];
	   for (let i = 0; i < parts; i++){
	      arr.push(n)
	   };
	   if(arr.reduce((a, b)=> a + b,0) === num){
	      return arr;
	   };
	   for(let i = 0; i < parts; i++){
	      arr[i]++;
	      if(arr.reduce((a, b) => a + b, 0) === num){
	         return arr;
	      };
	   };
	};
	var shareAmount = splitNumber(num, parts);
	var index = 0;

        async.eachSeries(shareAmount, function (collectionItem, asyncSeriesCB) {
        	var findQry = {
				_id:new ObjectId(userId[index])
			}

        	_findUser(findQry,function(userStatus,userDetails){
        		console.log(userDetails);
			if(userStatus){
				var updateQry = {
					_id:new ObjectId(userId[index])
				}
				var updateObj = {
					amount : parseInt(userDetails[0].amount) + parseInt(collectionItem)
				}
				console.log(updateObj);
	        	index = index + 1;
				_updateUser(updateObj,updateQry,function(updateStatus){
				    //done
				    asyncSeriesCB();
	            })
			}else{
				asyncSeriesCB();
			}
		})	
		}, function (error) {
			if(error){
				callback(error,null);
			}else{
				callback(null,'User amount updation completed1');
			}
		})
	

		
	


    // console.log(shareAmount);
	
}

//Logic to share amount exact
_shareExact = function (req,callback) {
	var userId = req.body.SharingUserId.split(",");
	var exactAmount = req.body.ExactAmount.split(",");
	var userLength = userId.length;
	var amount = req.body.Amount;
	amount = parseFloat(amount);
	const sum = exactAmount.reduce((a,b)=>parseFloat(a)+parseFloat(b));
	
	if(sum.toFixed(2)!=amount){
		callback('Total amount and exact amount are not equal',null)
	}
	var index = 0;
        async.eachSeries(exactAmount, function (collectionItem, asyncSeriesCB) {
        	var findQry = {
				_id:new ObjectId(userId[index])
			}
        	_findUser(findQry,function(userStatus,userDetails){
			if(userStatus){
				var updateQry = {
					_id:new ObjectId(userId[index])
				}
				var updateObj = {
					amount : parseInt(userDetails[0].amount) + parseInt(collectionItem)
				}
				console.log(updateObj);
	        	index = index + 1;
				 _updateUser(updateObj,updateQry,function(updateStatus){
				    //done
				    asyncSeriesCB();
	            })
			}else{
				asyncSeriesCB();
			}
		})	
		}, function (error) {
			if(error){
				callback(error,null);
			}else{
				callback(null,'User amount updation completed');
			}
		})
	
}

//Logic to share amount using percentage
_sharePercentage = function(req,callback){
	var userId = req.body.SharingUserId.split(",");
	var percentageAmount = req.body.Percentage.split(",");
	var userLength = userId.length;
	var amount = req.body.Amount;
	amount = parseFloat(amount);
	const percentage = percentageAmount.map(function(a){return ((parseInt(a)/ 100) * amount).toFixed(2)});
	const sum = percentage.reduce((a,b)=>parseFloat(a)+parseFloat(b));
	console.log(sum.toFixed(2),'sum');
	console.log(percentage,'percentage');
	if(sum.toFixed(2)!=amount){
		callback('Total amount and Percentage amount are not equal',null)
	}
	var index = 0;
    async.eachSeries(percentage, function (collectionItem, asyncSeriesCB) {
        	var findQry = {
				_id:new ObjectId(userId[index])
			}
        	_findUser(findQry,function(userStatus,userDetails){
			if(userStatus){
				var updateQry = {
					_id:new ObjectId(userId[index])
				}
				var updateObj = {
					amount : parseInt(userDetails[0].amount) + parseInt(collectionItem)				}
	        	index = index + 1;
				_updateUser(updateObj,updateQry,function(updateStatus){
				    //done
				    asyncSeriesCB();
	            })
			}else{
				asyncSeriesCB();
			}
		})	
		}, function (error) {
			if(error){
				callback(error,null);
			}else{
				callback(null,'User amount updation completed');
			}
		})
}

//Function to find user exist or not
_findUser = function(query,callback){
	 dbConnection.collection("user").find(query).toArray()
        .then(response => {
        	if(response.length){
        		callback(true,response);
        	}else{
        		callback(false,null);
        	}
        });
}

//User details insertion function
_insertUser = function(query,callback){
	dbConnection.collection("user").insertOne(query).then(response => {
			callback(helper._successResponse("User Created Successfully"));
	})
	.catch(err => {
	        callback(helper._errorResponse('Something went wrong'));
	})
}


//Used to update user details
_updateUser = function(updateQuery,findQuery,callback){
	dbConnection.collection('user').update(findQuery, {
            		'$set': updateQuery
        		})
            .then(response => {
                callback(helper._successResponse("OTP Generated Successfully"));
            })
            .catch(err => {
                console.log("ERROR-->", err)
                callback(helper._errorResponse('Something went wrong'));
            })
}