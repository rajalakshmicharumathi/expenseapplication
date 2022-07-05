## Api list

1. User creation
2. Otp generate
3. User login
4. Balance get for single user
5. Balance get for all the users
6. Sharing amount 


## User creation
     Api used for signup process once signup app get redirected to login page.

### Method - POST
* InputParam-[name, email, mobile number]
* Output - Success signup response

## Otp generate
	We need to generate otp for entered phone number bez we don't having password setting option so we need to generete otp to mobile and send it to user.

### Method - GET
* InputParam-[mobile number]
* Output - otp

## User login
	Once Otp is entered need to check entered otp is correct or not if correct we will return access token and redirect to dashboard page.

### Method - POST
* InputParam-[mobile number,otp]
* Output - token

## Balance get for single user
	Display particular user account balance details.

### Method - GET
* InputParam-[userId]
* Header - Token
* Output - user details

## Balance get for all the users
	Display all users account balance details.

### Method - GET
* InputParam-Nill
* Header - Token
* Output - user details

## Sharing amount
	Api used to share amount

### Method - PUT
* InputParam-[SharingUserId,Expense,Amount,Exact>>amount,Percentage]
* Header - Token
* Output - Amount added detail


## Instructions For Accessing API

* Step 1 : User creation>>create user
* Step 2 : OTP >> Genereate opt
* Step 3 : Login >> Login using OTP
* Step 4 : Share/View User Details

## Procedure For Installation

* Npm install
* Update mongodb url and other config in config.ts file
* Run Command node server.js
* Access Api using postman collection shared in email

## API URL : localhost:7009/api

## Mongo Db Model

* Collection : user

