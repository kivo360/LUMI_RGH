
/**
 * Module dependencies.
 */

var express = require('express'),
	http = require('http'),
	path = require('path'),
	util = require('util'),
	mongoose = require('mongoose'),
	async = require('async'),
	passport = require('passport'),
	gm = require('googlemaps'),
	Patient = require('./models/patient.js'),
	Physician = require('./models/doctor.js'),
	Schema = mongoose.Schema,
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
if ('development' == app.get('env')){
	app.use(express.errorHandler());
}

//Create Data
var hostSchema = Schema({
	name: String,
	belonging: String,
	address: String,
	pplNum: Number,
	type: String,
	lnglat: [],
	patients: [{ type: Schema.Types.ObjectId, ref: 'Patient' }],
	doctors: [{ type: Schema.Types.ObjectId, ref: 'Physician' }]
	
});

// lnglat: [chance.floating({min: 43.1292, max: 43.1575, fixed: 3}), chance.floating({min: -77.6060, max: -77.6285})]

var Hospital = mongoose.model('Hospital', hostSchema);


//Strong Labs Array
var strong = [{
	name: 'Strong Memorial Hospital: Moss Arthur MD',
	address: '601 Elmwood Ave, Rochester, NY 14642',
	lnglat: [43.1226626, -77.623601 ]
}, {
	name: 'Strong Memorial Clinical Lab',
	address: '1815 Clinton Ave S Rochester, NY 14618',
	lnglat: [43.124265, -77.594984]
}, {
	name: 'Strong Health Geriatrics Group: Sathasivam Rajaletchum MD',
	address: '435 E Henrietta Rd Rochester, NY 14620',
	lnglat: [43.1134528, -77.6161636]
},{
	name: 'Strong Memorial Hospital',
	address: '125 Lattimore Rd Rochester, NY 14620',
	lnglat: [43.117946, -77.623435]
}, {
	name: 'Strong Behavioral Older Adults',
	address: '315 Science Pkwy Rochester, NY 14620',
	lnglat: [43.1192319, -77.608459]
}, {
	name: 'Strong Gyn Specialities: Foster David C MD',
	address: '500 Red Creek Dr # 110 Rochester, NY 14623',
	lnglat: [43.064485, -77.6304372]
}, {
	name: 'Strong Physical Therapy',
	address: '444 E Main St Rochester, NY 14604',
	lnglat: [43.1584642, -77.6005335]
}];

var rgh = [{
	name: 'Rochester General Hospital Blood Lab',
	address: '440 Cross Keys Office Park Fairport, NY 14450',
	lnglat: [43.0707355, -77.4341326]
}, {
	name: 'Rochester General Hospital',
	address: '1425 Portland Ave Rochester, NY 14621',
	lnglat: [ 43.192443, -77.58589979999999]
}, {
	name: 'Rochester General Hosptial Blood Lab',
	address: '1401 Stone Rd #202 Rochester, NY 14615',
	lnglat: [43.21482899999999, -77.65996]
}, {
	name: 'Rochester General Hospital',
	address: '1850 E Ridge Rd Rochester, NY 14622',
	lnglat: [43.202504,-77.568444]
}, {
	name: 'Rochester General Med Group: Arango Ana Maria MD',
	address: '10 Hagen Dr Rochester, NY 14625',
	lnglat: [43.1258676, -77.5176605]
}];

app.get('/', function (req, res) {
	
	res.render('index');
});

//Force create hospitals 

app.get('/createHospitals', function (req, res) {
//---------------- Create Strong -------------------------------------------------------

async.each(strong, function (item, cb) {
	var hosItem = {
			name: item.name,
			belonging: 'Strong',
			address: item.address,
			pplNum: chance.integer({min: 40, max: 1000}),
			lnglat: item.lnglat
		};
		Hospital.create(hosItem, cb);
	}, function (err) {
	
});
//------------------- Create RGH --------------------------------------------------------
async.each(rgh, function (item, cb) {
	var hosItem = {
			name: item.name,
			belonging: 'RGH',
			address: item.address,
			pplNum: chance.integer({min: 40, max: 1000}),
			lnglat: item.lnglat
		};
		Hospital.create(hosItem, cb);
	}, function (err) {
	});
	res.send("Stuff created");
});

//Find directions
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
			res.send("No, Data Found");
		}
		
	});
});

//Get all hospitals
app.get('/allHospitals', function (req, res) {
	Hospital.find({}, function (err, hos) {
		res.json(hos);
	});
});

//Hospitals with patient info
//Warning - - spends more time
app.get('/hosAll', patHospital);

//Clean all databases
app.get('/cleanup', function (req, res) {
	cleanup();
	res.send("response");
});

//Creates address
app.get('/address', function (req, res) {
	for (var i = 0; i < 20; i++) {
		getAddress(coordAround(43.178447, -77.551366, 0.012));
	}
	res.json("Complete");
});

app.get('/newDoctor', createDoctor);

//Creates address with parameters
app.get('/address/:long/:lat/:dist', function (req, res) {
	var longitude = req.params.long;
	var latitude = req.params.lat;
	var dist = req.params.dist;
	getAddress(coordAround(Number(longitude), Number(latitude), Number(dist)));
	res.send("No");
});

//Find long/lat from address
app.get('/data/:address', function (req, res) {
		geoCode((req.params.address).toString());
		
		res.send("location");

});

//create server
http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});



//------------------------------------------------------------------------------------------
//------------------------------------- Functions ------------------------------------------
//------------------------------------------------------------------------------------------

//Record time to get to clinic or hospital
function recordDistance (time) {
	var timeInSeconds = time;
	console.log(timeInSeconds + " seconds of travel = " + (timeInSeconds/60) + " minutes");
}

//Get Address for each coordinate.
function getAddress (LL) {
	var lnglatC = LL[0].toString() + "," + LL[1].toString();
	gm.reverseGeocode(lnglatC , function (err, result) {
		//Check if things are successful
		if (result.status === 'OK') {
			//Waterfall callbacks to add patients
			
			async.waterfall([
				//----------------------------------------------- First ------------------------------------
				//----------------------------------------- Find all hospitals -----------------------------
				function(callback){
					Hospital.find({}, function (err, result) {
						callback(null, result);
					});
				},
				//----------------------------------------------- Second ------------------------------------
				//------------------------------------------- Create patient -------------------------------
				function(arg1, callback){
					new Patient({
							lname: chance.last(),
							address: result.results[0].formatted_address,
							gender: chance.gender(),
							age: chance.age(),
							ethnicity: chance.pick(['Hispanic', 'American Indian', 'Asian', 'African American', 'Pacific Islander', 'White', 'Nonresident alien']),
							lnglat: LL
						}).save(function (err, patient) {
							if (err)
								console.log(err);
							callback(null, patient, arg1);
						});
				//---------------------------------------------- Third -------------------------------------		
				//------------------------------------- Add patients to hospitals --------------------------
				},
				function(pat, hos, callback){
					// arg1 now equals 'three'
					var hospitallist = chance.pick(hos);
					hospitallist.patients.push(pat);
					hospitallist.save();
					callback(null, 'successful');
				}
			],
			//--------------------------------------------------- Finish -----------------------------------
			//------------------------------------------------- The Result ---------------------------------
			function (err, result) {
				console.log(result);
			});
		
		}else{
			
		}
	});
}

//----------------------- Respond Full Data --------------------
function patHospital (req, res) {
	Hospital
	.find({})
	.populate('patients doctors')
	.exec(function (err, all) {
		res.json(all);
		// prints "The creator is Aaron"
	});
}

function geoCode (address) {
		async.waterfall([
		function(callback){
			gm.geocode(address.toString(), function (err, goooooog) {
			var location = goooooog.results[0].geometry.location;
			console.log(location);
			callback(null, location);
			});
		}], function (err, result) {
			console.log(result);
		});
}

//Find coordinate around a certain point
function coordAround (lng, lat, dist) {
	var lngmin = lng - dist;
	var latmin = lat - dist;
	var lngmax = lng + dist;
	var latmax = lat + dist;

	var longitude = chance.floating({min: lngmin, max: lngmax, fixed: 8});
	var latitude =	chance.floating({min: latmin, max: latmax, fixed: 8});
	return [longitude, latitude];
}

//Clear all DBs
function cleanup(){
	Patient.remove(function() {
		mongoose.disconnect();
	});
	Hospital.remove(function() {
		mongoose.disconnect();
	});
}



function createDoctor (req, res) {
	async.waterfall([
				//----------------------------------------------- First ------------------------------------
				//----------------------------------------- Find all hospitals -----------------------------
				function(callback){
					Hospital.find({}, function (err, result) {
						callback(null, result);
					});
				},
				//----------------------------------------------- Second ------------------------------------
				//------------------------------------------- Create patient -------------------------------
				function(arg1, callback){
					var randRVU = chance.integer({min: 5, max: 300});
					new Physician({
							profession: chance.pick(['Anesthesiologists', 'Cardiologists', 'Coroners‎', 'Dentists', 'Dermatologists‎', 'Diabetologists‎', 'Gynaecologists', ' Hematologists', 'Hygienists‎', 'Immunologists‎', 'Neurologists‎', 'Neurosurgeons‎', 'Oncologists‎', 'Obstetricians‎', 'Ophthalmologists‎', 'Paleopathologists', 'Parasitologists', 'Pathologists‎', 'Pediatricians']),
							RVU: randRVU,
							estimatedRVU: randRVU * chance.floating({min: 0, max: 2})
						}).save(function (err, patient) {
							if (err)
								console.log(err);
							callback(null, patient, arg1);
						});
				//---------------------------------------------- Third -------------------------------------		
				//------------------------------------- Add patients to hospitals --------------------------
				},
				function(pat, hos, callback){
					// arg1 now equals 'three'
					var hospitallist = chance.pick(hos);
					hospitallist.doctors.push(pat);
					hospitallist.save();
					callback(null, 'successful');
				}
			],
			//--------------------------------------------------- Finish -----------------------------------
			//------------------------------------------------- The Result ---------------------------------
			function (err, result) {
				// console.log(result);
				res.send(result);
			});
}