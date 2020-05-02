console.log("working");

var apiKey = 'pk.eyJ1IjoibWlyZmFraHJ1bGhhc3NhbiIsImEiOiJjazBza2hnejMwM21nM250Y2ZmejFoMjMyIn0.x85bT44G-mn4zZVlI7DjtQ';

var gmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
  maxZoom: 20,
  id: "mapbox.streets",
  accessToken: apiKey
});

// Create options
var map = L.map("mapid", {
  center: [
    40.7, -94.5
  ],
  zoom: 3
});

// Add gmap to map
gmap.addTo(map);

// Retrieve earthquake data
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function(data) {

  // Functiion to calculate the color and radius.
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: Color(feature.properties.mag),
      color: "#000000",
      radius: Radius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // Determine color based upon magnitude
  function Color(magnitude) {
    switch (true) {
    case magnitude > 5:
      return "#ea2c2c";
    case magnitude > 4:
      return "#ea822c";
    case magnitude > 3:
      return "#ee9c00";
    case magnitude > 2:
      return "#eecc00";
    case magnitude > 1:
      return "#d4ee00";
    default:
      return "#98ee00";
    }
  }

  // Determine radius based on magnitude
  
  function Radius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }

    return magnitude * 4;
    }

    // Add earthquake layer
    L.geoJson(data, {
        // Create Circlemarkers for features
        pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng);
        },
        style: styleInfo,
        // popups for markers
        onEachFeature: function(feature, layer) {
        layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
        }
  }).addTo(map);

  // Create Legend
  var legend = L.control({
    position: "bottomright"
  });

  // Add details to legend
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");

    var degrees = [0, 1, 2, 3, 4, 5];
    var colors = [
      "#98ee00",
      "#d4ee00",
      "#eecc00",
      "#ee9c00",
      "#ea822c",
      "#ea2c2c"
    ];

    // Loop to generate colors for each interval
    for (var i = 0; i < degrees.length; i++) {
      div.innerHTML +=
        "<i style='background: " + colors[i] + "'></i> " +
        degrees[i] + (degrees[i + 1] ? "&ndash;" + degrees[i + 1] + "<br>" : "+");
    }
    return div;
  };

  // Add legend to map.
  legend.addTo(map);
});
