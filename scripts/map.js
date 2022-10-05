mapboxgl.accessToken = 'pk.eyJ1Ijoia21ldHJpIiwiYSI6ImNsOG13YXB3aDBjcDgzbnA2NXdlN2l4aXIifQ.jUbiYPlYMwIypK5ejLMoOA';

traficLights = [];
routes = []
markers = []

var pos1 = null;

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [2.32062190534, 48.8941496486],
    zoom: 11
});

// Add Market on click & paint road
map.on('click', function(event) {
    var coordinates = event.lngLat;
    if (pos1 == null) {
        pos1 = [coordinates.lng, coordinates.lat];
        addMarker(coordinates);
    } else {
        createRoadLines(pos1, [coordinates.lng, coordinates.lat]);
        pos1 = null;
        addMarker(coordinates);
    }
});

createTraficLights();

function createTraficLights() {
    fetch("coord_2.json")
        .then(r => r.json())
        .then(r => {
            r.forEach(coord => {
                let traficLight = new TraficLight(coord[0], coord[1]);
                traficLights.push(traficLight);
                placeTraficLight(traficLight);
            });
        });
}

function placeTraficLight(traficLight) {
    var circle = new MapboxCircle({lat: traficLight.lat, lng: traficLight.lng}, 10, {
        id: "circle",
        editable: false,
        minRadius: 5,
        fillColor: traficLight.color
    }).addTo(map);

    circle.on("click", function () {
        traficLight.switchColor();
        circle.options.fillColor = traficLight.color;
    });
}

function addMarker(position) {
    const marker = new mapboxgl.Marker()
        .setLngLat([position.lng, position.lat])
        .addTo(map)

    markers.push(marker);
}

function getValue(start, end) {
    let vectorLng = (end[0] - start[0]);
    let vectorLat = (end[1] - start[1]);

    return Math.abs(vectorLng) + Math.abs(vectorLat);
}

function getChrono(start, end, baseValue, baseChrono) {
    let requiredValue = getValue(start, end);
    return Math.floor((requiredValue * baseChrono) / baseValue);
}

function getNearTraficLight(position) {
    for (let i = 0; i < traficLights.length; i++) {
        let traficLight = traficLights[i];

        if (distance([traficLight.lng, traficLight.lat], [position[0], position[1]]) < 0.0003) {
            return traficLight;
        }
    }
    return null;
}

function distance(pos1, pos2) {
    return Math.abs(pos1[0] - pos2[0] + pos1[1] - pos2[1]);
}

function moveCar(routes) {
    let currentRoute = 0;

    let currentStart = routes[currentRoute];
    let nextStart = routes[currentRoute + 1];

    const car = new mapboxgl.Marker()
        .setLngLat([currentStart[0], currentStart[1]])
        .addTo(map);

    let start = currentStart;

    let baseChrono = 100;
    let baseValue = 0.0235;

    let vectorLng = (nextStart[0] - currentStart[0]) / baseChrono;
    let vectorLat = (nextStart[1] - currentStart[1]) / baseChrono;

    let chrono = 0;
    let requiredChrono = getChrono(currentStart, nextStart, baseValue, baseChrono);

    console.log(baseValue);

    let interval = window.setInterval(function () {
        chrono++;

        start = [start[0] + vectorLng, start[1] + vectorLat];

        car.setLngLat(start);

        // ROUTE FINIE
        if (chrono === requiredChrono) {
            currentRoute++;
        }

        // TOUTES ROUTES FINIES
        if (currentRoute + 1 === routes.length) {
            window.clearInterval(interval);
            return;
        }

        // ROUTE FINIE
        if (chrono === requiredChrono) {
            currentStart = routes[currentRoute];
            nextStart = routes[currentRoute + 1];

            requiredChrono = getChrono(currentStart, nextStart, baseValue, baseChrono);
            console.log(requiredChrono);

            chrono = 0;

            start = currentStart;

            vectorLng = (nextStart[0] - currentStart[0]) / requiredChrono;
            vectorLat = (nextStart[1] - currentStart[1]) / requiredChrono;
        }

    }, 10);

}

async function createRoadLines(origin, destination) {

    let routeCoords = origin[0] + "," + origin[1] + ";" + destination[0] + "," + destination[1];

    const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/` + routeCoords + `?steps=true&geometries=geojson&access_token=` + mapboxgl.accessToken,
        {method: 'GET'}
    );
    const json = await query.json();
    const data = json.routes[0];
    const coords = data.geometry.coordinates;

    var route = {
        'type': 'FeatureCollection',
        'features': [
            {
                'type': 'Feature',
                'geometry': {
                    'type': 'LineString',
                    'coordinates': coords
                }
            }
        ]
    };

    moveCar(coords);

    routes.push(route);

    map.addSource('route' + routes.length, {
        'type': 'geojson',
        'data': route
    });

    map.addLayer({
        'id': 'route' + routes.length,
        'source': 'route' + routes.length,
        'type': 'line',
        'paint': {
            'line-width': 3,
            'line-color': '#007cbf'
        }
    });
}