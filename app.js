
/**
 * Module dependencies.
 */

var express = require('express'),
  http = require('http'),
  path = require('path'),
  util = require('util'),
  mongoose = require('mongoose'),
  passport = require('passport'),
  gm = require('googlemaps'),
  Schema = mongoose.Schema,
  // Hospital = require('./models/hostpital.js'),
  Chance = require('chance');

var app = express();
var chance = new Chance();
mongoose.connect('mongodb://localhost/mydb', function(err){
    if(err) {
        console.log(err);
    }
    else {
        console.log("Connected to mongo DB");
    }
});
gm.config("google-private-key", "AIzaSyAJixUspbzJBIIVH7Jt6DukdpGfbA4wIPE");

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function (req, res) {
	
	res.render('index');
});


app.get('/loop', function (req, res) {
  var rand1 = chance.zip();
  var rand2 = chance.zip();
  var stuff1 = rand1.toString();
  var stuff2 = rand2.toString();
  console.log(stuff1);
  console.log(stuff2);
  var time;
  gm.directions(stuff1, stuff2 , function (err, data) {
		if(data.status === 'OK'){
			time = data.routes[0];
			console.log(time);
			res.json(data);
		}
		else {
			res.send("404 Link is broken");
		}
		
	});
});

var hostSchema = Schema({
	pplNum: Number,
	lnglat: [Number]
	
});

var Hospital = mongoose.model('Hospital', hostSchema);

app.get('/createHostpital', function (req, res) {
  //create coodinate
	console.log("Creating Hospital");
	new Hospital({
		pplNum: chance.integer({min: 50, max: 1000}),
		lnglat: [chance.floating({min: 43.1292, max: 43.1575, fixed: 7}), chance.floating({min: -77.6060, max: -77.6285, fixed: 7})]
		}).save(function (err, host) {
			console.log(host);
		});
	res.send("Hello");
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

function recordDistance (time) {
	var timeInSeconds = time.value;
	console.log(timeInSeconds + " seconds of travel = " + (timeInSeconds/60) + " minutes");
}

