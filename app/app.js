//setup express to handle routing and rendering
var express = require('express');
var app = express();
app.set('view engine', 'ejs');

// route to index page
app.get('/', function(req, res) {
    res.render('page/landing');
});

//start the web app
app.listen(8080, function () {
	console.log('App listening on port 8080!');
});
