window.onload = function () {
    const online = L.layerGroup();
    const onlineIcon = L.icon({
        iconUrl: "/images/marker-online.png",
        iconSize: [32, 32],
        shadowSize: [32, 32],
        iconAnchor: [16, 16],
        shadowAnchor: [16, 16],
        popupAnchor: [0, 0]
    });
    const offline = L.layerGroup();
    const offlineIcon = L.icon({
        iconUrl: "/images/marker-offline.png",
        iconSize: [32, 32],
        shadowSize: [32, 32],
        iconAnchor: [16, 16],
        shadowAnchor: [16, 16],
        popupAnchor: [0, 0]
    });
    const mapURL = "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW5hcnMiLCJhIjoiY2tlZGowaHY1MDFldTJ6b3oyeW9pNTN2bSJ9.jIFUKXstg5M4vuD6_KuNyg";
    const attribution = "Map data, Imagery &copy; <a href=\"https://www.openstreetmap.org\">OpenStreetMap</a>, <a href=\"https://www.mapbox.com\">Mapbox</a> and contributors. <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>";
    const layerLight = L.tileLayer(mapURL, {
        id: 'mapbox/light-v10',
        tileSize: 512,
        zoomOffset: -1,
        attribution
    });
    const layerDark = L.tileLayer(mapURL, {
        id: 'mapbox/dark-v10',
        tileSize: 512,
        zoomOffset: -1,
        attribution
    });
    const layerStreets = L.tileLayer(mapURL, {
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        attribution
    });
    const layerOutdoors = L.tileLayer(mapURL, {
        id: 'mapbox/outdoors-v11',
        tileSize: 512,
        zoomOffset: -1,
        attribution
    });
    const layerSatellite = L.tileLayer(mapURL, {
        id: 'mapbox/satellite-streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        attribution
    });
    const maxBounds = L.latLngBounds(
        L.latLng(38, -94), // Nortwest
        L.latLng(15, -70) // Southeast
    );
    const fitBounds = L.latLngBounds(
        L.latLng(31, -84), // Nortwest
        L.latLng(24, -80) // Southeast
    );
    NodeStatus.forEach((node, index) => {
        if (typeof node.name === "undefined") {
            node.name = `Node #${index + 1}`;
        }
        L.marker([node.latitude, node.longitude], {
            "icon": node.online ? onlineIcon : offlineIcon
        }).bindPopup(`
        <table>
        <tr><td><strong>Name</strong></td><td><strong>&nbsp;:&nbsp;</strong></td><td>${node.name}</td></tr>
        <tr><td><strong>Status</strong></td><td><strong>&nbsp;:&nbsp;</strong></td><td>${node.online ? "Online" : "Offline"}</td></tr>
        <tr><td><strong>County</strong></td><td><strong>&nbsp;:&nbsp;</strong></td><td>${node.county}</td></tr>
        <tr><td><strong>​Region</strong></td><td><strong>&nbsp;:&nbsp;</strong></td><td>${node.region}</td></tr>
        <tr><td><strong>Grid Zone</strong></td><td><strong>&nbsp;:&nbsp;</strong></td><td>${node.grid_zone}</td></tr>
        <tr><td><strong>100 km id</strong></td><td><strong>&nbsp;:&nbsp;</strong></td><td>${node.hundred_km_id}</td></tr>
        <tr><td><strong>Updated On</strong></td><td><strong>&nbsp;:&nbsp;</strong></td><td>${node.last_update}</td></tr>
        </table>
        `).addTo(node.online ? online : offline);
    });
    const map = L.map("map", {
        "maxZoom": 18,
        "minZoom": 6,
        maxBounds,
        "layers": [layerLight, online]
    });
    map.setMaxBounds(maxBounds);
    map.fitBounds(fitBounds);
    map.createPane("labels");
    map.getPane("labels").style.zIndex = 650;
    map.getPane("labels").style.pointerEvents = "none";
    L.geoJson(floridaCounties, {
        "style": {
            "weight": 1,
            "fillOpacity": 0
        }
    })
        .addTo(map);
    const baseLayers = {
        "Light": layerLight,
        "Dark": layerDark,
        "Streets": layerStreets,
        "Outdoors": layerOutdoors,
        "Satellite": layerSatellite
    };
    const overlays = {
        "Online": online,
        "Offline": offline
    };
    L.control.layers(baseLayers, overlays).addTo(map);
    function onLocationFound(e) {
        var radius = e.accuracy / 2;
        L.marker(e.latlng).addTo(map)
            .bindPopup("You are within " + (radius | 1) + " meters from this point").openPopup();
        L.circle(e.latlng, radius).addTo(map);
    }
    function onLocationError(error) {
        // alert(error.message);
        // console.error(error);
    }
    function onMapClick(e) {
        console.log(e.latlng);
    }
    map.on('click', onMapClick);
    map.on("locationfound", onLocationFound);
    map.on("locationerror", onLocationError);
};