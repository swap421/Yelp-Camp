mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
container: 'map', // container ID
style: 'mapbox://styles/mapbox/light-v10', // style URL
center: campground.geometry.coordinates, // starting position [lng, lat]
zoom: 8 // starting zoom
});
//setting marker on map
new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    // setting popup for marker
    .setPopup(
        new mapboxgl.Popup({offset:25})
            .setHTML(
                `<h3>${campground.title}</h3><p>${campground.location}</p>`
            )
    )
    .addTo(map)
//Adding controls to show-page map, we can pass second argument as top-left,bottom-right for positioning
//by default it is top-right
map.addControl(new mapboxgl.NavigationControl(),'top-right');