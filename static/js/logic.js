// Create the map object
var myMap = L.map("map",{
    center: [37.8044, -122.2712],
    zoom: 6
});

// Add the tile layer
var topo = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(myMap);

// Style the markers
function circleColor(depth){
    if  (depth >= 10) {return '#3B3638'}
        else if (depth < 10 && depth >= 8) {return '#B84278'}
        else if (depth < 8 && depth >= 6) {return '#CD5C5C'}
        else if (depth < 6 && depth >= 4) {return '#FFA07A'}
        else if (depth < 4 && depth >= 2) {return '#FFEB87'}
        else {return '#96C96C'}
};

// Generate the circles as and adjust their color and size
function pointToCircle(point, latlng){ 
    let depth = point['geometry']['coordinates'][2];
    let magnitude = point['properties']['mag']*10000;
    return L.circle(latlng,{
            'color': circleColor(depth),
            'fillColor': circleColor(depth),
            'fillOpacity': .3,
            'radius': magnitude
    });
};

// Create a popup on each feature
function bindPopup(geo_feature, layer){
    layer.bindPopup(`Location: ${geo_feature.properties.place} <br> Magnitude: ${geo_feature.properties.mag} <br> Depth: ${geo_feature.geometry.coordinates[2]}`);
};

// Use the USGS link to get the GeoJSON data (for Significant earthquakes in the last 30 days) 
var dataUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'

// Get the GeoJSON data
d3.json(dataUrl).then(function(data){
    let features = data['features'];
    console.log(data['features'])
    // Create a GeoJSON layer with the retrieved data
    let geojsonLayer = L.geoJSON(features, {
        'pointToLayer': pointToCircle,
        'onEachFeature': bindPopup
    })
    geojsonLayer.addTo(myMap);

    // Add the legend
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = () => {
        var div = L.DomUtil.create('div', 'info legend');
        grades = [0, 2, 4, 6, 8, 10];

        for (var i = 0; i < grades.length; i++){
            div.innerHTML +=
            '<i style ="background:' + circleColor(grades[i] + 1) + '"> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(myMap);
});