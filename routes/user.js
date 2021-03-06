var express = require('express');
var request = require('request');
var yaml = require('js-yaml');
var fs = require('fs');
var users = express.Router();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var unlencodedParser = bodyParser.urlencoded({ extended: false });

if (process.env.NODE_ENV == 'test') {
  var api_url = 'http://localhost:3000/';
} else {
  var api_url = 'http://ec2-13-125-205-170.ap-northeast-2.compute.amazonaws.com:3000/';
}

var AWS = require("aws-sdk");
const uuidv1 = require('uuid/v1');

try {
  var doc = yaml.safeLoad(fs.readFileSync('./config/secrets.yml', 'utf8'));
} catch (e) {
  console.log(e);
}

AWS.config.update({
    region: "ap-northeast-2",
    endpoint: "https://dynamodb.ap-northeast-2.amazonaws.com"
});

var docClient = new AWS.DynamoDB.DocumentClient();

users.get('/login', function(req, res) {
    res.render('login.html');
    res.end();
});

users.get('/', function(req, res) {
    res.render('login.html');
    res.end();
});

//when user logs in or registers
users.post('/login', unlencodedParser, function(req, res) {
  if (req.body.username_login == doc.HSNL_platform_admin.USER && req.body.pwd_login == doc.HSNL_platform_admin.PWD) {
    res.cookie('checker', "blank");
    res.cookie('area', "blank");
    res.cookie('group', "blank");
    res.cookie('sensor', "blank");
    res.cookie('admin', "aDmiN");
    res.cookie('controller', "blank");

    res.redirect('homepage_admin.html');
  } else {
    request.post({url: api_url + 'api/account/login', form: {"email": req.body.username_login, "password": req.body.pwd_login}} , function (error, response, body) {
      console.log('error:', error);
      console.log('statusCode:', response && response.statusCode);
      console.log('body:', body);
      res.cookie('checker', body);
      res.cookie('area', "blank");
      res.cookie('group', "blank");
      res.cookie('sensor', "blank");
      res.cookie('admin', "blank");
      res.cookie('controller', "blank");
      if (body == "false") {
          res.render('page_404_sign_in.html');
      } else {
          res.redirect('homepage.html');
      }
    });
  }
});

users.post('/register', unlencodedParser, function(req, res) {
  request.post({url: api_url + 'api/account', form: {"email": req.body.email_signup, "password": req.body.pwd_signup, "name": req.body.username_signup}} , function (error, response, body) {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log('body:', body);
    });

    res.render('login.html');
});

module.exports = users;
