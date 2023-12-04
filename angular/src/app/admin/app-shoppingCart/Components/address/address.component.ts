import { Component, Injector } from "@angular/core";
import { DemoUiComponentsServiceProxy } from "@shared/service-proxies/service-proxies";

@Component({
    selector: "app-address",
    templateUrl: "./address.component.html",
    styleUrls: ["./address.component.scss"],
})
export class AddressComponent {
    addressCode: string;
    addressName: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    postalCode: String;
    selectedCountry: any;
    countries: any[] = [];

    constructor(private demoUiComponentsService: DemoUiComponentsServiceProxy) {
        this.filterCountries();
    }

    // get countries
    filterCountries() {
        this.demoUiComponentsService
            .getCountries(null)
            .subscribe((countries) => {
                console.log(">>", countries);
                this.countries = countries;
            });
    }
}
