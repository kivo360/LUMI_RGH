var map = L.map('map').setView([43.16556,  -77.61139], 13);

// L.tileLayer('http://{s}.tile.cloudmade.com/6eaba29e08fe4d748bd1af2e811b1dcb/997/256/{z}/{x}/{y}.png', {
//     attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
//     maxZoom: 18
// }).addTo(map);

var OpenStreetMap_DE = L.tileLayer('http://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
}).addTo(map);

var marker = L.marker([43.16556,  -77.61139]).addTo(map);

//Adding a circle. (point[long,Lat], radius in meters
var circle = L.circle([43.16556,  -77.61139], 500, {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5
}).addTo(map);

marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a circle.");

var zip = "/javascripts/zcta5.json",
hsa = "/javascripts/hsa.json";

var zip_layer = L.geoJson(null, {
        style: {
            color: '#666',
            weight: 0.5,
            opacity: 1,
            fillOpacity: 0.1
    }
}).addTo(map);



// L.geoJson(zip.object(), {
    
// }).addTo(map);

$.getJSON(zip, function (data) {
    var zip_geojson = topojson.feature(data, data.objects.zcta5);
    console.log(zip_geojson);
	zip_layer.addData(zip_geojson);
});

