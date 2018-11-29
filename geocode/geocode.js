function handle(place) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(place);
            console.log(JSON.parse(this.responseText));

            showResults(JSON.parse(this.responseText));
        }
    };
    xhttp.open('GET', 'http://localhost:3000/data?data=geocode-zone&place=' + place, true);
    xhttp.send();
}

function getZone(center, callback) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            callback(JSON.parse(this.responseText).zone);
        }
    };
    xhttp.open('GET', 'http://localhost:3000/data?data=coordinates-zone&lon=' + center[0] + '&lat=' + center[1], true);
    xhttp.send();
}

function showResults(results) {
    var ul = document.getElementById('placeList');
    ul.innerHTML = '';
    results.forEach(element => {
        var li = createListItem(element.text, element.place_name);
        li.onclick = function() {
            getZone(element.center, (zone) => {
                document.getElementById('zone').innerHTML = zone;
            })
        };
        ul.appendChild(li);
    });
}

function createListItem(text1, text2) {
    let li = document.createElement('li');
    li.innerHTML = '<b>' + text1 + '</b><br>' + text2;
    return li;
}
