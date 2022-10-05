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
    var circle = new MapboxCircle({lat: traficLight.lat, lng: traficLight.lng}, 5, {
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

function moveCar(routes) {

    let current = routes[0];
    let next = routes[1];
    let i = 0;

    let currentLng = current[0];
    let currentLat = current[1];

    const car = new mapboxgl.Marker()
        .setLngLat([currentLng, currentLat])
        .addTo(map);

    let intervalA = window.setInterval(function() {

        let a = 0;
        var lng = (next[0] - current[0]) / 100;
        var lat = (next[1] - current[1]) / 100;

        let intervalB = window.setInterval(function () {
            a++;

            currentLng += lng;
            currentLat += lat;

            car.setLngLat([currentLng + lng, currentLat + lat]);

            if (a === 100) {
                try {
                    a = 0;
                    current = next;
                    next = routes[i];

                    lng = (next[0] - current[0]) / 100;
                    lat = (next[1] - current[1]) / 100;

                    car.setLngLat([next[0], next[1]]);
                    window.clearInterval(intervalB);
                } catch (error) {
                    window.clearInterval(intervalB);
                }
            }
        }, 10);
        i++;

        if (i >= routes.length) {
            window.clearInterval(intervalB);
            window.clearInterval(intervalA);
        }

    }, 1000);

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