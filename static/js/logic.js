// grab json objects and assign to variables
var earthquakes_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
//console.log(earthquakes_URL) --> we are able to view the json object

var plates_URL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
//console.log(plates_URL) --> we are able to view the json object

// Initialize all the layergroups we need - which are earthquakes and tectonic plates
var earthquakes = new L.LayerGroup()
var tectonicPlates = new L.LayerGroup()

// Create different tile layers that we can toggle through
var satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
});

var grayscaleMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
});

var outdoorsMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "'mapbox/streets-v11",
    accessToken: API_KEY
});

// Create Base maps
var baseMaps = {
    "Satellite": satelliteMap,
    "Grayscale": grayscaleMap,
    "Outdoors": outdoorsMap
};

// Create Overlays 
var overlayMaps = {
    "Tectonic Plates": tectonicPlates,
    "Earthquakes": earthquakes
}

// Create a map with our layers
var myMap = L.map("mapid", {
    center: [37.09, -95.71],
    zoom: 2,
    layers: [satelliteMap, earthquakes]
});

// Create a layer control where we can choose the basemaps
// Also add overlay Maps onto the control layer
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
}).addTo(myMap);

// Retrieve data from the USGS earthquakes GeoJSON data
d3.json(earthquakes_URL, function(earthquakeData) {
    
    //create a function to make a marker size proportional to the magnitude recorded
    function markerSize(magnitude) {
        switch (true) {
            case magnitude > 7:
                return magnitude * 8;
            case magnitude > 6:
                return magnitude * 7;
            case magnitude > 5:
                return magnitude * 6;
            case magnitude > 4:
                return magnitude * 5;    
            case magnitude > 3:
                return magnitude * 4;    
            case magnitude > 2:
                return magnitude * 3;
            case magnitude > 1:
                return magnitude * 2;                
            default:
                return 1;
    }}

    // Function to Determine Color of Marker Based on the Magnitude of the Earthquake
    function chooseColor(magnitude) {
        switch (true) {
        case magnitude > 7:
            return "#8B0000";
        case magnitude > 6:
            return "#B22222";
        case magnitude > 5:
            return "#FF4500";
        case magnitude > 4:
            return "#FF8C00";
        case magnitude > 3:
            return "#F0E68C";
        case magnitude > 2:
            return "#FFFF00";
        case magnitude > 1:
            return "#7CFC00";
        default:
            return "#00FFFF";
        }
    }

    function styleInfo(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: chooseColor(feature.properties.mag),
            color: "#000000",
            radius: markerSize(feature.properties.mag),
            stroke: true,
            weight: 0.5
        }
    }

    // Create a GeoJSON layer containing features array from the earthquakeData object
    L.geoJSON(earthquakeData, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: styleInfo,
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h4>Location: " + feature.properties.place +
            "</ha><hr><p>Date & Time: " + new Date(feature.properties.time) +
            "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
        }
    }).addTo(earthquakes)
    earthquakes.addTo(myMap);

    d3.json(plates_URL, function(plateData) {
        L.geoJson(plateData, {
            color: "#DC143C",
            weight: 2
        }).addTo(tectonicPlates);
        tectonicPlates.addTo(myMap)
    });

    // Set Up Legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend"), 
        magnitudeLevels = [1, 2, 3, 4, 5, 6, 7];

        div.innerHTML += "<h3>Earthquake Depth</h3>"

        for (var i = 0; i < magnitudeLevels.length; i++) {
            div.innerHTML +=
                '<i style="background: ' + chooseColor(magnitudeLevels[i] + 1) + '"></i> ' +
                magnitudeLevels[i] + (magnitudeLevels[i + 1] ? '&ndash;' + magnitudeLevels[i + 1] + '<br>' : '+');
        }
        return div;
    };
    // Add Legend to the Map
    legend.addTo(myMap);
    
});