const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const app = express();

app.set('view engine', 'ejs');

app.use(express.static('public')); //tell express to serve up this public folder as a static resource.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

let chartdata, init;
// handle get requests here
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

app.get('/combinedReactorCalculation', function(req, res) {
  res.render('combinedReactorCalculation', init)
});

app.get('/datasheet', function(req, res) {
  res.render('datasheet', chartdata);
});

app.post('/api-chartdata', function(req, res){
  chartdata = req.body;
});

app.post('/api-calculation', function(req, res) {
  init = req.body;
});

// Does not require changes
app.listen(3000, function() {
  console.log('Server started on port 3000');
});
