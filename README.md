## Maps Api

Initial view presents a Google Map view centered on USA showing all of USA. Allows user to zoom in/out and move map view. a Text box allows search for street address, this submission should move map view to that address with a app-configurable zoom level. 

Also, Two "tool icons" allow user to switch between pinning a location and defining the area of a location: ...With pin location selected, user can single click to obtain nearest street level address, which should auto populate the address search box. ...With area tool selected, user can click and drag to draw a "bounding box" area on top of the map. Lat/Long for four corners of the box and square footage or mileage should be displayed either as a map overlay or in separate text box elements on the page. 

finally, "save" button will save the current view and metadata (map view, location pin, area box, lat/long and area calculation metadata) to browser local-storage and to a obj literal.

### Configuration

Be sure you have had set your own GoogleMaps Location Key, otherwise this won't work correctly. (Check geocodeForm.html file)
