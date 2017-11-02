var express = require('express');

var app = express();
var multer = require('multer');


var cors = require('cors');
var util = require('util');


var port = process.env.PORT || 8042;
var bodyParser = require('body-parser');
var dateFormat = require('dateformat');
var now = new Date();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get('/', cors(), function(req, res, next) {
    res.json({ msg: 'This is CORS-enabled for all origins!' });
});

// routes ======================================================================
require('./config/routes.js')(app); // load our routes and pass in our app and fully configured passport


//launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);

//catch 404 and forward to error handler
app.use(function(req, res, next) {
    res.status(404).render('404', { title: "Sorry, page not found", session: req.sessionbo });
});

app.use(function(req, res, next) {
    res.status(500).render('404', { title: "Sorry, page not found" });
});

exports = module.exports = app;