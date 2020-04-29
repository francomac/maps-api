'use strict';

let map;
let typeMapSatellite = false;
let markers = [];
let PolygonPaths = [];
let finallDataSet = {};
let selectedShape;
let currentLatLng;
let locationForm = document.getElementById('location-form');
let locationInput = document.getElementById('location-input').value;

locationForm.addEventListener('submit', getAddressData);

/* 
initMap function, first thing this function takes a key/pair obj to set initial options i order to create a new map. 
This function creates n new map to an center it to a default location, in this case is USA coordinates. 
Also, this function invokes getNearestStreet().
*/
function initMap(){

  initAutocomplete();
  currentLatLng = new google.maps.MVCArray();

  // Map options
  let options = {
    zoom: 4,
    center: { lat:37.09024,lng:-95.712891 }, // USA coordinates by default
    disableDefaultUI: true,
    mapTypeId: 'roadmap'
  }

  // Create new map
  map = new google.maps.Map(document.getElementById('map'), options);

  finallDataSet.MapZoom = 4; // default zoom
  
  // display default address data.
  getAddressData();

  // add eventListener to get nearest street whenever user clicks on map.
  getNearestStreet();

}

/* 
setMapType fucntion, Modify the map type in use by the Map by setting its mapTypeId property by calling the map's setMapTypeId() method. The mapTypeID property defaults to roadmap. Also, save this state in finalDataSet obj.A lso, this function receives 1 parameter, already selected type map from API.
*/
function setMapType(loadedMapType) {

  if(loadedMapType !== undefined) {
    map.setMapTypeId(loadedMapType);
    finallDataSet.MapType = loadedMapType;

    if(loadedMapType == 'satellite') { 
      typeMapSatellite = true; 
    } else if(loadedMapType == 'roadmap') { 
      typeMapSatellite = false; 
    }

  } else {
    typeMapSatellite = !typeMapSatellite; // toogle map type from 'roadmap' to 'satellite'
    if(typeMapSatellite) { 
      map.setMapTypeId('satellite');
      finallDataSet.MapType = 'satellite';
    } else {
      map.setMapTypeId('roadmap');
      finallDataSet.MapType = 'roadmap';
    }
  }

}

/* 
setNewZoom fucntion, takes an event object to extract its zoon value from UI input with name setZoom. 
This function set a new zoom value for an existing map. Also, this function receives 2 parameters, an event param from search input and and optional existing zoom from API.
*/
function setNewZoom(e, loadedZoom){

  let zoomInput = document.getElementById('map-zoom');

  if(loadedZoom == undefined) {
    map.setZoom(+e.srcElement.value);
    finallDataSet.MapZoom = +e.srcElement.value;
  } else {
    zoomInput.value = loadedZoom;
    map.setZoom(loadedZoom);
    finallDataSet.MapZoom = loadedZoom;
  }

}

/* 
getNearestStreet function, when click on loaded map this function invokes DirectionsService object. This object communicates with the Google Maps API Directions Service which receives direction requests and returns an efficient path. Travel time is the primary factor which is optimized, but other factors such as distance, number of turns and many more may be taken into account. https://developers.google.com/maps/documentation/javascript/directions
*/
function getNearestStreet() {

  // adding marker to get nearest street address
  let directionsService = new google.maps.DirectionsService();

  google.maps.event.addListener(map, 'click', function(event) {

      // Saving Current Location into Dataset
      finallDataSet.Location = { 'lat': event.latLng.lat(), 'lng': event.latLng.lng()};

      // specifying the origin and destination in a directions request, you can specify a query string a LatLng value
      let request = {
          origin: event.latLng, 
          destination: event.latLng,
          travelMode: google.maps.DirectionsTravelMode.DRIVING
      };

      // initiate a request to the Directions service, passing it a DirectionsRequest object literal containing the input terms and a callback method to execute upon receipt of the response.
      directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {

            // removing all markers from markers array and from map.
            for (var i = 0; i < markers.length; i++) {
              markers[i].setMap(null);
            }

            // creating and adding a new marker into markers array and map instance.
            let marker = new google.maps.Marker({
              position: response.routes[0].legs[0].start_location, 
              map: map,
              title: JSON.stringify({
                lat: response.routes[0].legs[0].start_location.lat(), 
                lng: response.routes[0].legs[0].start_location.lng()
              })
            });
            markers.push(marker);
      
            // saving nearStreet data
            finallDataSet.NearStreet = [{
              lat: response.routes[0].legs[0].start_location.lat(), 
              lng: response.routes[0].legs[0].start_location.lng(),
              address: response.routes[0].legs[0].end_address
            }];
            
            // center map to a new location according to nearest street selected.
            map.panTo({lat: response.routes[0].legs[0].start_location.lat(), lng: response.routes[0].legs[0].start_location.lng()});
            
            // display new address data according to new location selected.
            getAddressData(null , {lat: response.routes[0].legs[0].start_location.lat(), lng: response.routes[0].legs[0].start_location.lng()} );
        }
      });
  });
}

/* 
getAddressData function, when click on loaded map this function invokes DirectionsService object. This object communicates with the Google Maps API Directions Service which receives direction requests and returns an efficient path. Travel time is the primary factor which is optimized, but other factors such as distance, number of turns and many more may be taken into account. Also, this function receives 2 parameters, an event param from search input and and optional existing location from API.
https://developers.google.com/maps/documentation/javascript/directions
*/
function getAddressData(e, locationCoordsLoaded = ''){

  // Prevent actual submit
  if(e) { e.preventDefault() };

  let paramsData = {};
  
  // loading data from API with params from localStorage or address typed in search bar.
  if(locationInput !== '') {
    console.log('1');
    paramsData = {
      address: locationInput,
      key:'AIzaSyCauvfbmM2SXnm15JCJYBAo1fQkKc_tzrY'
    }
  }
  
  if(locationCoordsLoaded !== '') { 
    console.log('2');
    paramsData = {
      latlng: locationCoordsLoaded.lat + ',' + locationCoordsLoaded.lng,
      key:'AIzaSyCauvfbmM2SXnm15JCJYBAo1fQkKc_tzrY'
    }
  } 
  
  if(locationInput == '' && locationCoordsLoaded == '') {
    console.log('3');
    paramsData = {
      latlng: "37.09024,-95.712891", // USA by default)
      key:'AIzaSyCauvfbmM2SXnm15JCJYBAo1fQkKc_tzrY'
    }
  }


  // method to access an endpoint
  axios.get('https://maps.googleapis.com/maps/api/geocode/json',{
    params: paramsData
  })
  .then(function(response){

    // center map to a new location according to response data.
    map.panTo(response.data.results[0].geometry.location);

    // Formatted Address
    let formattedAddress = response.data.results[0].formatted_address;
    let formattedAddressOutput = `
        <ul class="list-group">
        <li class="list-group-item"><strong>Location:</strong>${formattedAddress}</li>
        </ul>
    `;

    // Address Components
    let addressComponents = response.data.results[0].address_components;
    // console.log(response.data.results[0].address_components);
    
    let addressComponentsOutput = '<ul class="list-group">';
    for(let i = 0;i < addressComponents.length;i++) {

      switch (addressComponents[i].types[0]) {
        case "country":
          addressComponentsOutput += `<li class="list-group-item"><strong>Country</strong>: ${addressComponents[i].long_name}</li>`;
          break;
        case "administrative_area_level_1":
          addressComponentsOutput += `<li class="list-group-item"><strong>State/Province</strong>: ${addressComponents[i].long_name}</li>`;
          break;
        case "administrative_area_level_2":
          addressComponentsOutput += `<li class="list-group-item"><strong>Country</strong>: ${addressComponents[i].long_name}</li>`;
          break;
        case "street_number":
          addressComponentsOutput += `<li class="list-group-item"><strong>Street Address 1</strong>: ${addressComponents[i].long_name}</li>`;
          break;
        case "route":
          addressComponentsOutput += `<li class="list-group-item"><strong>Street Address 2</strong> (Optional): ${addressComponents[i].long_name}</li>`;
          break;
        case "locality":
          addressComponentsOutput += `<li class="list-group-item"><strong>Town/City</strong>: ${addressComponents[i].long_name}</li>`;
          break;
        case "postal_code":
          addressComponentsOutput += `<li class="list-group-item"><strong>Zip/ Postal Code</strong>: ${addressComponents[i].long_name}</li>`;
          break;
        default:
          break;
      }
    }
    addressComponentsOutput += '</ul>';

    // Geometry
    let lat = response.data.results[0].geometry.location.lat;
    let lng = response.data.results[0].geometry.location.lng;
    let geometryOutput = `
        <ul class="list-group">
        <li class="list-group-item"><strong>Latitude</strong>: ${lat}</li>
        <li class="list-group-item"><strong>Longitude</strong>: ${lng}</li>
        </ul>
    `;

    // Output to app
    document.getElementById('formatted-address').innerHTML = formattedAddressOutput;
    document.getElementById('address-components').innerHTML = addressComponentsOutput;
    document.getElementById('geometry').innerHTML = geometryOutput;
  })
  .catch(function(error){
    console.log(error);
  });
}

/* 
turnOnDrawingTool function, The DrawingManager class provides a graphical interface for users to draw polygons, rectangles, polylines, circles, and markers on the map. https://developers.google.com/maps/documentation/javascript/drawinglayer
https://developers.google.com/maps/documentation/javascript/reference/event
*/
let drawingManager;
let shapes = [];
function turnOnDrawingTool() {

  // check if it drawing control was already loaded.
  if($('.gmnoprint').length <= 2) {

    let shapes = [];

    // options that define the set of controls to display, the position of the control, and the initial drawing state.
    drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.MARKER,
      drawingControl: true,
      drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: ['polygon', 'rectangle']
      },
      polygonOptions: {
          editable: true,
          draggable: true,
          strokeColor: '#EFCC00',
          strokeOpacity: 1,
          strokeWeight: 2,
          fillColor: '#ffffde'
      }
    });
    drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    drawingManager.setMap(map);
  
    // Add a listener for creating new shape event.
    google.maps.event.addListener(drawingManager, "overlaycomplete", function (event) {
        let newShape = event.overlay;
        newShape.type = event.type;
        shapes.push(newShape);
        if (drawingManager.getDrawingMode()) {
            drawingManager.setDrawingMode(null);
        }
        // selecting new shape to a globla scope
        selectedShape = newShape;
    });
  
    // add a listener for the drawing mode change event, delete any existing polygons
    google.maps.event.addListener(drawingManager, "drawingmode_changed", function () {
        if (drawingManager.getDrawingMode() != null) {
            for (var i = 0; i < shapes.length; i++) {
                shapes[i].setMap(null);
            }
            shapes = [];
        }
    });

    // Add a listener for the "drag" event.
    google.maps.event.addListener(drawingManager, "overlaycomplete", function (event) {
    
      if ((event.type == google.maps.drawing.OverlayType.POLYLINE) || (event.type == google.maps.drawing.OverlayType.POLYGON)) {

        overlayDragListener(event.overlay);
        $('#vertices').val(event.overlay.getPath().getArray());
        
        event.overlay.getPath().getArray().forEach(element => {
          PolygonPaths.push({ lat: element.lat(), lng: element.lng()})
        });
        console.log(PolygonPaths)                
        finallDataSet.PolygonPaths = PolygonPaths;
  
        // selecting new shape to a globla scope
        selectedShape = event.overlay;

      } else if (event.type == google.maps.drawing.OverlayType.RECTANGLE) {

        //get lat/lng bounds of the current shape
        let bounds = event.overlay.getBounds();
        let start = bounds.getNorthEast();
        let end = bounds.getSouthWest();
        let center = bounds.getCenter();
        console.log("RECTANGLE:");
        console.log('start', {'start lat': start.lat(), 'start lng': start.lng()} );
        console.log('end', {'end lat': end.lat(), 'end lng': end.lng()} );
        finallDataSet.SquareBounds = [
          {'start lat': start.lat(), 'start lng': start.lng()},
          {'end lat': end.lat(), 'end lng': end.lng()},
          {'center lat': center.lat(), 'center lng': center.lng()}
        ];
      }
      
    });

  }
}
function overlayDragListener(overlay) {

  if ((overlay.type == google.maps.drawing.OverlayType.POLYLINE) || (overlay.type == google.maps.drawing.OverlayType.POLYGON)) {

    // SetAt sets an element at the specified index.
    google.maps.event.addListener(overlay.getPath(), 'set_at', function (event) {
      $('#vertices').val(overlay.getPath().getArray());

      // console.log('new area selected: ');
      PolygonPaths = [];
      finallDataSet.PolygonPaths = [];
      overlay.getPath().getArray().forEach(element => {
        // console.log(element.lat());
        // console.log(element.lng());
        PolygonPaths.push({ lat: element.lat(), lng: element.lng()});
      });
      finallDataSet.PolygonPaths = PolygonPaths;

    });

    // InsertAt inserts an element at the specified index.
    google.maps.event.addListener(overlay.getPath(), 'insert_at', function (event) {
      $('#vertices').val(overlay.getPath().getArray());
    }); 

  } else if (overlay.type == google.maps.drawing.OverlayType.RECTANGLE) {

    //get lat/lng bounds of the current shape
    let bounds = event.overlay.getBounds();
    let start = bounds.getNorthEast();
    let end = bounds.getSouthWest();
    let center = bounds.getCenter();
    console.log("RECTANGLE:");
    console.log('start', {'start lat': start.lat(), 'start lng': start.lng()} );
    console.log('end', {'end lat': end.lat(), 'end lng': end.lng()} );
    finallDataSet.SquareBounds = [
      {'start lat': start.lat(), 'start lng': start.lng()},
      {'end lat': end.lat(), 'end lng': end.lng()},
      {'center lat': center.lat(), 'center lng': center.lng()}
    ];
    
  }

}

/* 
turnOffDrawingTool function, this function cleans up all job done related with drawings and shapes. disable DrawingControl box, deletes existing shapes, and removes any shape from finalDataSet.
*/
function turnOffDrawingTool() {
  
  if (selectedShape) {
    selectedShape.setMap(null);
  }
  
  if (drawingManager != undefined) {
    drawingManager.setOptions({
      drawingControl: false
    });
    drawingManager.setMap(null); 
    
    PolygonPaths = [];
    finallDataSet.PolygonPaths = [];
    finallDataSet.SquareBounds = [];
  }

} 

/* 
saveData function, save the current view and metadata (map view, location pin, area box, lat/long and area calculation metadata)
*/
function saveData() {
  console.log(finallDataSet);
  localStorage.setItem('dataset', JSON.stringify(finallDataSet));
}

function loadMarkers(loadedMarker) {
            
  if(loadedMarker !== undefined && loadedMarker.length >= 0) {

    let marker = new google.maps.Marker({
      position: { lat: loadedMarker[0].lat, lng: loadedMarker[0].lng },
      map: map
    });

    // center map to a marker location.
    map.panTo({lat: loadedMarker[0].lat, lng: loadedMarker[0].lng});

  };
}

function loadData() {
  let loadedDataset = JSON.parse(localStorage.getItem('dataset'));

  if (loadedDataset !== null) {

    getAddressData(null ,loadedDataset.Location);
    setNewZoom(null, loadedDataset.MapZoom);
    setMapType(loadedDataset.MapType);
    loadMarkers(loadedDataset.NearStreet);
  } else {
    console.log('there are no data');
  }
}

/* 
This example displays an address form, using the autocomplete feature of the Google Places API to help users fill in the information. 
This example requires the Places library. Include the libraries=places parameter when you first load the API. For example:
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">
*/
let placeSearch, autocomplete;
let componentForm = {
  street_number: 'short_name',
  route: 'long_name',
  locality: 'long_name',
  administrative_area_level_1: 'short_name',
  country: 'long_name',
  postal_code: 'short_name'
};

function initAutocomplete() {
  // Create the autocomplete object, restricting the search to geographical
  // location types.
  autocomplete = new google.maps.places.Autocomplete(
      /** @type {!HTMLInputElement} */(document.getElementById('location-input')), {types: ['geocode']});

  autocomplete.addListener('place_changed', () => {
    let place = autocomplete.getPlace();
    locationInput = place.formatted_address;
  });
  // When the user selects an address from the dropdown, populate the address
  // fields in the form.
  // autocomplete.addListener('place_changed', fillInAddress);
}

// function fillInAddress() {
//   // Get the place details from the autocomplete object.
//   let place = autocomplete.getPlace();

//   for (let component in componentForm) {
//     document.getElementById(component).value = '';
//     document.getElementById(component).disabled = false;
//   }

//   // Get each component of the address from the place details
//   // and fill the corresponding field on the form.
//   for (let i = 0; i < place.address_components.length; i++) {
//     let addressType = place.address_components[i].types[0];
//     if (componentForm[addressType]) {
//       let val = place.address_components[i][componentForm[addressType]];
//       document.getElementById(addressType).value = val;
//     }
//   }
// }

// Bias the autocomplete object to the user's geographical location,
// as supplied by the browser's 'navigator.geolocation' object.
function geolocate() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      let geolocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      let circle = new google.maps.Circle({
        center: geolocation,
        radius: position.coords.accuracy
      });
      autocomplete.setBounds(circle.getBounds());
    });
  }
}




























  
/* /////////////////////////////////////////////////////////////////////////
////// SET POLYGON
function setPolygon() {

  // Listen for click on map
  google.maps.event.addListener(map, 'click', function(event){

    console.log(event.latLng.lat());
    console.log(event.latLng.lng());
    currentLatLng.push(new google.maps.LatLng(event.latLng.lat(), event.latLng.lng()));
    console.log(currentLatLng);


    let polygonOptions = { path: currentLatLng, strokeColor: 'yellow', fillColor: '#ffffed'};
    let polygon = new google.maps.Polygon(polygonOptions);

    polygon.setMap(map);
    
  });

}

/////////////////////////////////////////////////////////////////////////
////// EVENTS and MARKERS

function setEventsMarkers(coords) {

    // Listen for click on map
    google.maps.event.addListener(map, 'click', function(event){
      // Add marker
      addMarker({coords:event.latLng});
    });

    google.maps.event.addListener(map,'zoom_changed', function(event) {
      let zoomLevel = map.getZoom();
      console.log('zoom changed', event, zoomLevel);
    });

    // Array of markers
    let markers = [
      {
        coords:{lat:42.4668,lng:-70.9495},
        iconImage:'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
        content:'<h1>Lynn MA</h1>'
      },
      {
        coords:{lat:42.8584,lng:-70.9300},
        content:'<h1>Amesbury MA</h1>'
      },
      {
        coords:{lat:42.7762,lng:-71.0773}
      }
    ];

    // Loop through markers
    for(let i = 0;i < markers.length;i++){
      // Add marker
      addMarker(markers[i]);
    }

    // Add Marker Function
    function addMarker(props){
      let marker = new google.maps.Marker({
        position:props.coords,
        map:map,
        //icon:props.iconImage
      });

      // Check for customicon
      if(props.iconImage){
        // Set icon image
        marker.setIcon(props.iconImage);
      }

      // Check content
      if(props.content){
        let infoWindow = new google.maps.InfoWindow({
          content:props.content
        });

        marker.addListener('click', function(){
          infoWindow.open(map, marker);
        });
      }
    }

}

/////////////////////////////////////////////////////////////////////////
////// SHAPES
function setShapes() {

    // rectangle bounds
    let bounds = {
      north: 42.599,
      south: 42.490,
      east: -69.443,
      west: -69.649
    };
    // Define a rectangle and set its editable property to true.
    let rectangle = new google.maps.Rectangle({
      bounds: bounds,
      editable: true,
      draggable: true,
      map:map,
      geodesic: true
    });

    // Define a Polygon Coords.
    let redCoords = [
      {lat: 42.774, lng: -71.190},
      {lat: 42.466, lng: -71.118},
      {lat: 42.321, lng: -71.757}
    ];
    // Construct a draggable red triangle with geodesic set to true.
    new google.maps.Polygon({
      map: map,
      paths: redCoords,
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      draggable: true,
      geodesic: true
    });

    // Define a symbol using SVG path notation, with an opacity of 1.
    var lineSymbol = {
      path: 'M 0,-1 0,1',
      strokeOpacity: 1,
      scale: 4,
      strokeColor: 'yellow',
      draggable: true
    };
    // Define a Line Coords
    let dottedLines = [
      { lat: 42.991, lng: -71.0 }, 
      { lat: 42.991, lng: -71.1 }, 
      { lat: 42.991, lng: -71.2 }, 
      { lat: 42.991, lng: -71.3 }, 
      { lat: 42.091, lng: -71.4 }
    ]
    // Create the polyline, passing the symbol in the 'icons' property.
    // Give the line an opacity of 0.
    // Repeat the symbol at intervals of 20 pixels to create the dashed effect.
    var line = new google.maps.Polyline({
      path: dottedLines,
      strokeOpacity: 0,
      icons: [{
        icon: lineSymbol,
        offset: '0',
        repeat: '20px'
      }],
      map: map
    });
    
  } */