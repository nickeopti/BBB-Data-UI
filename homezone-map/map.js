var map;
var points = [];

function createMap() {
    map = L.map('map').setView([48.1337, 11.56118], 12);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1Ijoibmlja2VvcHRpIiwiYSI6ImNqb3g5NzE4djFpOGEzcXMzZWJ3dnVqcDYifQ.ZdU0TDhGUUTVHBD44givWw'
    }).addTo(map);
}

function addHomezones(zone, day) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // remove existing circles first
            points.forEach(circle => {
                map.removeLayer(circle);
            })
            points = [];

            JSON.parse(this.responseText).forEach(zone => {
                let point = L.circle([zone.lat, zone.lon], {
                    color: 'red',
                    fillColor: '#f03',
                    fillOpacity: Math.pow(zone.share, 1.0/3.0),
                    radius: zone.size * 500
                }).addTo(map);
                points.push(point);
            });
        }
    };
    xhttp.open('GET', 'http://localhost:3000/data?data=homezone-points&zone=' + zone + '&day=' + day, true);
    xhttp.send();
}
