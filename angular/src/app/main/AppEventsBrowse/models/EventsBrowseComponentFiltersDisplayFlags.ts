
export class EventsBrowseComponentFiltersDisplayFlags {
    filterType: boolean;
    search: boolean;
    sorting: boolean;
    timeZone: boolean;
    startDate: boolean;
    startTime: boolean;
    endDate: boolean;
    endTime: boolean;
    city: boolean;
    postalCode: boolean;
    state: boolean;
    isOnline: boolean;
    showAll() {
        this.filterType = true;
        this.search = true;
        this.sorting = true;
        this.timeZone = true;
        this.startDate = true;
        this.startTime = true;
        this.endDate = true;
        this.endTime = true;
        this.city = true;
        this.postalCode = true;
        this.state = true;
        this.isOnline = true;
    }
    allIsHidden: boolean;
}
