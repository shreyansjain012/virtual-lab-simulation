//dependencies
const express = require('express');
const bodyParser = require('body-parser');

// const chart = require(__dirname + "/public/js/conversionChart.js"); 

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

//tell express to serve up this public folder as a static resource.
app.use(express.static('public'));

//listens to all GET requests
app.get('/', function(req, res) {
  res.render('index');
});

app.get('/theory', function(req, res) {
  res.render('theory');
});

app.get('/procedure', function(req, res) {
  res.render('procedure');
});

app.get('/prequiz', function(req, res) {
  res.render('prequiz');
});

app.get('/simulation', function(req, res) {
  res.render('simulation');
});

app.get('/postquiz', function(req, res) {
  res.render('postquiz');
});

app.get('/video', function(req, res) {
  res.render('video');
});

app.get('/sim2', function(req, res){
  res.render('sim2');
});

app.get('/calculation', function(req, res){
  res.render('calculation');
});


app.listen(3000, function() {
  console.log('Server started on port 3000');
});
