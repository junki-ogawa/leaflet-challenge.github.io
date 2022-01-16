async function main() {

    // Fetch the data 
    const response = await fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson");
    const data = await response.json();

    createFeatures(data);
}

function createFeatures(data) {
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
    }
    function pointToLayer(feature, latlng) {
        return L.circleMarker(latlng, 
            {
                radius:getRadius(feature.properties.mag),
                fillColor: getColor(feature.geometry.coordinates[2]),
                color: getColor(feature.geometry.coordinates[2])
            });
    }    

    // for mag, make radius smaller/larger
    // for depth, make lighter/darker
    //function here for depth and mag
    function getRadius(mag) {
        return mag > 6 ? 20:
            mag > 5.7 ? 15:
            mag > 5.4 ? 13:
            mag > 5.1 ? 11:
            mag > 4.8 ? 9:
            mag > 4.5 ? 7:
            mag > 4.2 ? 5:
            2;
    }

    
    function getColor (d) {
        return d > 100 ? '#800026' :
            d > 50  ? '#BD0026' :
            d > 20  ? '#E31A1C' :
            d > 15  ? '#FC4E2A' :
            d > 10   ? '#FD8D3C' :
            d > 5   ? '#FEB24C' :
            d > 2   ? '#FED976' :
            '#FFEDA0';
    }
    ////https://leafletjs.com/reference.html#circlemarker

    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    // point to layer binds marker to geojson layer
    // oneachfeature creates the popups
    var earthquakes = L.geoJSON(data, {
        onEachFeature: onEachFeature,
        pointToLayer: pointToLayer
    });
    createMap(earthquakes);
}


function createMap(earthquakes) {
    // Create the base layers.
    var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })

    var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    // Create a baseMaps object.
    var baseMaps = {
        "Street Map": street,
        "Topographic Map": topo
    };

    // Create an overlay object to hold our overlay.
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    var myMap = L.map("map", {
        center: [
        37.7, -122.4
        ],
        zoom: 3,
        layers: [street, earthquakes]
    });

    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        grades = [0, 2, 5, 10, 15, 20, 50, 100]
        var labels = [];
        var colors= [
            '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026'
        ];

        var legendInfo = "<h3>Depth of Earthquake</h3>"
            ;

        div.innerHTML=legendInfo;

        for (var i = 0; i < grades.length; i++) {
                div.innerHTML +=
                "<i style='background: " + colors[i] + "'></i> " +
                grades[i] + (grades[i + 1] ? ""  + "<br>" : "");
            }
        return div;
    };

    // Adding the legend to the map
    legend.addTo(myMap);

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
    
}
main();