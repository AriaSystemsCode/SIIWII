

export class EventsBrowseComponentStatusesFlags {
    attendingStatus: boolean;
    publicityStatus: boolean;
    showAll() {
        this.attendingStatus = true;
        this.publicityStatus = true;
    }
    allIsHidden: boolean;
}
