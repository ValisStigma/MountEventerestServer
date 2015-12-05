/**
 * Server configuration
 */
var express = require('express');
var bodyParser = require('body-parser');
var uuid = require('node-uuid');

var allowCrossDomain = function(request, response, next) {
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    response.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
};


/**
 * Event / guest storage
 */
var events = [];

function createEvent(id, name, description, targetGroup, contributionsDescription, location, times, maximalAmountOfGuests){
    if(name) {
        var event = {
            id: (id) ? id : uuid.v4(),
            name : name,
            description : description,
            targetGroup: targetGroup,
            contributionsDescription: contributionsDescription,
            location:location,
            times : times,
	        maximalAmountOfGuests : maximalAmountOfGuests,
            guests:[]
        };
        events.push(event);
        return event;
    } else {
        return null;
    }
}

function findEvent(id) {
    return events.filter(function(event) {
        return event.id == id
    })[0];
}

function createGuest(event, name, contribution, comment, id){
    if(event && event.guests) {
        var guest = {
            id: (id) ? id: uuid.v4(),
            name : name,
            contribution: contribution,
            comment: comment,
            cancel: false
        };
        event.guests.push(guest);
        return guest;
    } else {
        return null;
    }
}
function replaceGuest(event, oldGuest, newGuest){
    var index = event.guests.indexOf(oldGuest);
    if(~index){
        var result = (event.guests[index] = newGuest);
        return result;
    } else {
        return null;
    }
}
function findGuest(event, guestid){
    return event.guests.filter(function(guest){
        return guest.id ==  guestid;
    })[0];
}
function removeGuest(event, guestId){
    var guest = findGuest(event, guestId);
    if(guest){
        return event.guests.splice(event.guests.indexOf(guest),1);
    } else {
        return null;
    }
}

/**
 * Dummy data
 */
var event1 = createEvent(
    null,
    "HSR-Party",
    "Party an der HSR",
    "Studenten",
    "Kuchen",
    {
        name: "HSR",
        street: "Oberseestrasse",
        plz: 8640,
        city: "Rapperswil"
    },
    {
        begin: new Date('2015-11-15T19:00:00'),
        end: new Date('2011-11-16T03:00:00')
    },
    20
);
createGuest(event1, "Michael", "Schoggi-Kuchen", "Bin sicher zu früh", uuid.v4());
createGuest(event1, "Hans", "Hotdog-Cake", null, uuid.v4());

var event2 = createEvent(
    null,
    "Dinner",
    "Mitarbeiterdinner der HSR",
    "HSR Mitarbeiter",
    null,
    {
        name: "HSR",
        street: "Oberseestrasse",
        plz: 8640,
        city: "Rapperswil"
    },
    {
        begin: new Date('2015-11-20T18:00:00'),
        end: new Date('2011-11-20T21:00:00')
    },
    3
);

createGuest(event2, "F. Meier", null, null, uuid.v4());


/**
 * Basic server
 */
var app = express();
app.use(allowCrossDomain);
app.use(bodyParser.json());
app.use('/api', express.static(__dirname + '/api'));
app.use('/', express.static(__dirname + '/webapp/source'));
// tests, remove this for production
app.use('/tests', express.static(__dirname + '/webapp/tests'));
app.use('/source', express.static(__dirname + '/webapp/source'));


/**
 * API routes
 */
app.get('/api/events', function(request, response) {
    response.json({ events: events });
});

app.post('/api/events', function(request, response) {
    var event = createEvent(
       request.body.id,
       request.body.name,
       request.body.description,
       request.body.targetGroup,
       request.body.contributionsDescription,
       request.body.location,
       request.body.times,
       request.body.maximalAmountOfGuests
   );
   if(event) {
       response.json(event);
   } else {
       response.status(400).send('Event data incomplete.');
   }
});

app.get('/api/events/:id', function(request, response) {
    var event = findEvent(request.params.id);
    if (event) {
        response.json(event);
    } else {
        response.status(404).send('Event (id '+request.params.id+') not found.')
    }
});

app.get('/api/events/:id/guests', function(request, response) {
    var event = findEvent(request.params.id);
    if(event){
        response.json({ guests: event.guests });
    } else{
        response.status(404).send('Event (id '+request.params.id+') not found.')
    }
});

app.post('/api/events/:id/guests', function(request, response) {
    var event = findEvent(request.params.id);
    if(event){
        response.json(createGuest(
            event,request.body.name,
            request.body.contribution,
            request.body.comment,
            uuid.v4()
        ));
    } else{
        response.status(404).send('Event (id '+request.params.id+') not found.')
    }
});
app.post('/api/events/:event/guests/:guest', function(request, response){
    var event = findEvent(request.params.event);
    if(event){
        var guest = findGuest(event, request.params.guest);
        var newGuest = {
            id: request.body.id,
            name: request.body.name,
            contribution: request.body.contribution,
            comment: request.body.comment,
            cancel: false
        }
        response.json(replaceGuest(event, guest, newGuest));
    } else {
        response.status(404).send('Event (id '+request.params.event+') or guest (id '+request.params.guest + ') not found');
    }
});
app.delete('/api/events/:event/guests/:guest', function(request, response){
    var event = findEvent(request.params.event);
    if(event){
        response.json(removeGuest(event, request.params.guest));
    } else {
        response.status(404).send('Event (id '+request.params.event+') or guest (id '+request.params.guest + ') not found');
    }
});

/**
 * Server start
 */
var appPort = 8080;
app.listen(appPort);
console.log('Server running on port '+appPort);
