var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var config = require('./config');


var user = require('./User/user');

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));
// Add headers
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


app.get('/api', function (req, res) {
    res.send('Hello! This is Expense App micro-service');
});

/*Create User*/
app.post('/api/user', function (req, res) {
    user.userCreation(req.body, function (content) {
        res.send(content);
    });
});


/*Generate OTP*/
app.get('/api/otp', function (req, res) {
    user.generateOtp(req.query, function (content) {
        res.send(content);
    });
});

/*Login User*/
app.post('/api/login', function (req, res) {
    user.login(req.body, function (content) {
        res.send(content);
    });
});

/*Get single user details*/
app.get('/api/user', function (req, res) {
    user.getUser(req, function (content) {
        res.send(content);
    });
});

/*Get all user details*/
app.get('/api/user/all', function (req, res) {
    user.getallUser(req, function (content) {
        res.send(content);
    });
});

/*sharing amount api*/
app.put('/api/share', function (req, res) {
    user.share(req, function (content) {
        res.send(content);
    });
});


app.listen(config.server_port, function () {
    console.log('Expense App microservice was listening on port !' + config.server_port);
});