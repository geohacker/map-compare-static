// filesystem
var fs = require('fs');
var http = require('http');
var phantom = require('phantom');

var places = [];
// window.current = {};

var places = fs.readFileSync('cities.list').toString().split("\n");
for(i in places) {
    place = places[i];
    if (places[i]) {
        console.log(place);
        geocode(place);
    }
}

function geocode (place) {
    // var nominatimUrl = 'http://nominatim.openstreetmap.org/search/'+place+'?format=json&addressdetails=1&limit=1';
    http.get({
        host: 'nominatim.openstreetmap.org',
        port: 80,
        path: '/search/'+place+'?format=json&addressdetails=1&limit=1',
        method: 'GET'
    }, function(response) {
        var data = '';
        response.on('data', function (d) {
            // console.log(d);
            data += d;
        });
        response.on('end', function() {
            var parsed = JSON.parse(data);
            var coordinate = [parsed[0].lat, parsed[0].lon]
            if (coordinate) {
                compare(coordinate);
            }
            console.log(coordinate);
        });
    });
}

function compare (coordinate) {
    var pageUrl = 'http://lxbarth.com/compare/#14/'+coordinate[0]+'/'+coordinate[1];
    phantom.create("--ignore-ssl-errors=yes", "--ssl-protocol=any", function (ph) {
        ph.createPage(function (page) {
            page.set('viewportSize', {width:1280,height:900}, function(){
                page.set('clipRect', {top:0,left:0,width:1280,height:900}, function(){
                    page.open(pageUrl, function(status) {
                        setTimeout(function(){
                            page.render('screenshot.png', function(finished){
                                console.log('rendering '+pageUrl+' done');
                                ph.exit();
                            });
                        }, 6000);
                    });
                });
            });
        });
    });
}
