
export class EventsBrowseComponentActionsMenuFlags {
    publishOrUnpublish: boolean;
    delete: boolean;
    create: boolean;
    edit: boolean;
    view: boolean;
    showAll() {
        this.publishOrUnpublish = true;
        this.delete = true;
        this.edit = true;
        this.create = true;
        this.view = true;
    }
    allIsHidden: boolean;
}
