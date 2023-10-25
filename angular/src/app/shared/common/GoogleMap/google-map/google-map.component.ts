import { Component, OnInit, ViewChild } from "@angular/core";
import { ModalDirective } from "ngx-bootstrap/modal";
import { Loader } from "@googlemaps/js-api-loader"
declare const google:any
@Component({
    selector: "app-google-map",
    templateUrl: "./google-map.component.html",
    styleUrls: ["./google-map.component.scss"],
})
export class GoogleMapComponent implements OnInit {
    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
    location: string;
    apiKey: string = "AIzaSyDcYU42kL3hQJ0jH8PG7zJJRyVyIC4WBFM";
    map;
    places;

    constructor() {}

    ngOnInit(): void {

    }

    show(location: string) {
        const loader = new Loader({
            apiKey: this.apiKey,
            version: "weekly",
            // ...additionalOptions,
        });

        loader.load().then(() => {
            this.map = new google.maps.Map(document.getElementById("map"), {
                center: { lat: -34.397, lng: 150.644 },
                zoom: 8,
            });
        });

        this.location = location;
        /*  this.initAutocomplete(); */
        this.modal.show();
    }

    hide() {
        this.modal.hide();
    }

    service;
    infowindow;

    initMap() {
        const loader = new Loader({
            apiKey: this.apiKey,
            version: "weekly",
            // ...additionalOptions,
        });

        loader.load().then(() => {
            var sydney = new google.maps.LatLng(-33.867, 151.195);

            this.infowindow = new google.maps.InfoWindow();

            this.map = new google.maps.Map(
                document.getElementById('map'), {center: sydney, zoom: 15});

            var request = {
                query: 'Museum of Contemporary Art Australia',
                fields: ['name', 'geometry'],
            };

            var service = new google.maps.places.PlacesService(this.map);

            service.findPlaceFromQuery(request, function(results, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length; i++) {
                    createMarker(results[i]);
                }
                this.map.setCenter(results[0].geometry.location);
                }
            });

            function createMarker(place) {
                if (!place.geometry || !place.geometry.location) return;

                const marker = new google.maps.Marker({
                    map:this.map,
                    position: place.geometry.location,
                });

                google.maps.event.addListener(marker, "click", () => {
                    this.infowindow.setContent(place.name || "");
                    this.infowindow.open(this.map);
                });
            }
        });
    }

    /*
    initAutocomplete() {
        // Create the search box and link it to the UI element.
        const input = document.getElementById("location") as HTMLInputElement;
        const searchBox = new google.maps.places.SearchBox(input);

        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        // Bias the SearchBox results towards current map's viewport.
        this.map.addListener("bounds_changed", () => {
            searchBox.setBounds(
                this.map.getBounds() as google.maps.LatLngBounds
            );
        });

        let markers: google.maps.Marker[] = [];

        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        searchBox.addListener("places_changed", () => {
            this.places = searchBox.getPlaces();

            if (this.places.length == 0) {
                return;
            }

            // Clear out the old markers.
            markers.forEach((marker) => {
                marker.setMap(null);
            });
            markers = [];

            // For each place, get the icon, name and location.
            const bounds = new google.maps.LatLngBounds();

            this.places.forEach((place) => {
                if (!place.geometry || !place.geometry.location) {
                    console.log("Returned place contains no geometry");
                    return;
                }

                const icon = {
                    url: place.icon as string,
                    size: new google.maps.Size(71, 71),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(17, 34),
                    scaledSize: new google.maps.Size(25, 25),
                };

                // Create a marker for each place.
                var _map = this.map as google.maps.MapOptions;

                markers.push(new google.maps.Marker(_map));

                if (place.geometry.viewport) {
                    // Only geocodes have viewport.
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }
            });
            this.map.fitBounds(bounds);
        });
    } */

}
