var map = L.map('map').setView([43.16556,  -77.61139], 13);

var OpenStreetMap_DE = L.tileLayer('http://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
	attribution: '&copy;>'
}).addTo(map);

//Adding a circle. (point[long,Lat], radius in meters

// Saving for later :-)
// var zip = "/javascripts/zcta5.json",
// hsa = "/javascripts/hsa.json";

// Layer
var pointLayer = new L.featureGroup();
// var pointLayer = L.layerGroup();
var markersPatient = new L.MarkerClusterGroup();
var markersDoctor = new L.MarkerClusterGroup({spiderfyDistanceMultiplier: 4});
var host = new Array();
var temp;
//--------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------


$.getJSON("/hosAll",function(data,status){
	var color;
	var thefill;
	for (var i = 0; i < data.length; i++) {
		temp = data[i];
		placeDoctors(temp.doctors, temp.lnglat);
		// placePatients(temp.patients);
		if (temp.belonging === "RGH") {
			color = '#FF9755';
			thefill = '#009666';
		} else if (temp.belonging === "Strong") {
			color = '#FFE03A';
			thefill = '#7C83FF';
		}

		host.push(L.circle(data[i].lnglat, 250, {
			color: color,
			fillColor: thefill,
			fillOpacity: 0.8,
			weight:3
		}));

		// host.push(L.marker(data[i].lnglat, 250));
		host[i].on({
			click: zoomToFeature
		});
		// host[i].on('click', zoomToFeature);
		host[i].bindPopup(data[i].name + '<br>' + data[i].pplNum);
		host[i].addTo(pointLayer);
		

	}
});

pointLayer.addTo(map);

var svg = d3.select(map.getPanes().overlayPane).append("svg"),
g = svg.append("g").attr("class", "leaflet-zoom-hide");



var dIcon = L.Icon.extend({
	
});

var physicianIcon = new dIcon({
	iconUrl: '/images/doctor-icon.png', 
	iconSize: [60, 60]
});

L.icon = function (options) {
    return new L.Icon(options);
};
var physicianMark = L.Marker.extend({
	options: {
		doctorType: 'More data!',
		realRVU: 20,
		estimatedRVU: 20
	}
});

function zoomToFeature(e) {
	
	var lng = e.target._latlng.lng;
	var lat = e.target._latlng.lat;
	var southWest = L.latLng(lat - 0.005, lng - 0.005);
	var northEast = L.latLng(lat + 0.005, lng + 0.005);
	var bounds = new L.LatLngBounds(southWest, northEast);
	map.fitBounds(bounds);
}

// function placePatients (patients) {
//	for (var i = 0; i < patients.length; i++) {
//		console.log(patients[i].lnglat);
//		markersPatient.addLayer(new L.Marker(patients[i].lnglat).bindPopup(patients[i].lname + '<br>' + patients[i].age));
//	}
// }

function placeDoctors (doc, hosCoord) {
	// console.log(doc);
	// console.log(hosCoord);
	for (var i = 0; i < doc.length; i++) {
		// console.log(doc[i]);
		markersDoctor.addLayer(
			new physicianMark(hosCoord,
				{icon: physicianIcon,
					doctorType: doc[i].profession,
					realRVU: doc[i].RVU,
					estimatedRVU: doc[i].estimatedRVU
				}).bindPopup('Type:' + doc[i].profession + '<br> RVU: ' + doc[i].RVU + '<br> Estimated RVU: ' + doc[i].estimatedRVU));
	}
}
markersDoctor.on('click', sampleClick);

function sampleClick (e) {
	console.log(e);
}
map.addLayer(markersPatient);
map.addLayer(markersDoctor);