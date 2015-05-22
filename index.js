var fs = require('fs');
var http = require('http');
var phantom = require('phantom');
var async = require('async');

var collection = [];
var isLast = false;

var fileName = process.argv[2];
var places = fs.readFileSync(fileName).toString().split("\n");
for (var i = 0; i < places.length; i++) {
    place = places[i];
    if (i == (places.length - 1)) {
        isLast = true;
    }
    if (place) {
        geocode(place, isLast);
    }
};

function geocode (place, isLast) {
    // mapbox api.tiles.mapbox.com/v4/geocode/mapbox.places/Pune.json?access_token=pk.eyJ1IjoiZ2VvaGFja2VyIiwiYSI6ImFIN0hENW8ifQ.GGpH9gLyEg0PZf3NPQ7Vrg
    http.get({
        host: 'api.tiles.mapbox.com',
        port: 80,
        path: '/v4/geocode/mapbox.places/'+place+'.json?access_token=pk.eyJ1IjoiZ2VvaGFja2VyIiwiYSI6ImFIN0hENW8ifQ.GGpH9gLyEg0PZf3NPQ7Vrg',
        method: 'GET'
    }, function(response) {
        var data = '';
        response.on('data', function (d) {
            data += d;
        });
        response.on('end', function() {
            var coordinate;
            var parsed = JSON.parse(data);
            if (parsed.features.length > 0) {
                coordinate = parsed.features[0].center;
                collection.push({'coord': coordinate, 'place': place});
                if (isLast) {
                    async.mapLimit(collection, 1, compareGenerator.compare, function (err, result) {
                        // do nothing
                    });
                }
            }
        });
    });
}


var compareGenerator = {
    compare: function compare (data, callback) {
        console.log('comparing '+data.place);
        var compareUrl = 'http://lxbarth.com/compare/#14/'+data.coord[1]+'/'+data.coord[0];
        phantom.create("--ignore-ssl-errors=yes", "--ssl-protocol=any", function (ph) {
            ph.createPage(function (page) {
                page.set('viewportSize', {width:1280, height:900}, function(){
                    page.set('clipRect', {top:0, left:0, width:1280, height:900}, function(){
                        page.open(compareUrl, function(status) {
                            setTimeout(function(){
                                page.render(data.place+'.png', function(finished){
                                    console.log('rendering '+compareUrl+' done');
                                    ph.exit();
                                    callback(null, compareUrl);
                                });
                            }, 6000);
                        });
                    });
                });
            });
        });
    }
}
