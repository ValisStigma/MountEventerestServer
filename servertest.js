var http = require('http');


var postOptions = {
    host: 'localhost',
    port: '8080',
    path: '/api/events',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};


var postRequest = http.request(postOptions, function(response) {
    response.setEncoding('utf8');
    response.on('data', function (chunk) {
      console.log('Response: ' + chunk);
    });
});

// post the data
var data = {"name":"HSR-Party","desc":"Party an der HSR","targetGroup":"Studenten","contributionsDescription":"Kuchen","location":{"name":"hsr","street":"Oberseestrasse","plz":8640,"city":"Rapperswil"}};
postRequest.write(JSON.stringify(data));
postRequest.end();


var postOptions = {
    host: 'localhost',
    port: '8080',
    path: '/api/events/2/guests',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};

var postRequest = http.request(postOptions, function(response) {
    response.setEncoding('utf8');
    response.on('data', function (chunk) {
        console.log('Response: ' + chunk);
    });
});

var guest = {"name":"Bob","contribution":"Nichts","comment":"-"};
postRequest.write(JSON.stringify(guest));
postRequest.end();
