//jshint esversion:6
const express = require('express');
const bodyParser = require('body-parser');

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

app.listen(3000, function() {
  console.log('Server started on port 3000');
});
