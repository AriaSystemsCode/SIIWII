import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetTicketNoteForViewDto, TicketNoteDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { FileDownloadService } from "@shared/download/fileDownload.service";
//import '~bootstrap/scss/bootstrap';
@Component({
    selector: 'viewTicketNoteModal',
    styleUrls:  ["./view-ticketNote-modal.component.scss"],
    templateUrl: './view-ticketNote-modal.component.html'

})
export class ViewTicketNoteModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetTicketNoteForViewDto;


    constructor(
        injector: Injector, private _downloadService: FileDownloadService
    ) {
        super(injector);
        this.item = new GetTicketNoteForViewDto();
        this.item.ticketNote = new TicketNoteDto();
    }

    show(item: GetTicketNoteForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }

    // sara Start

    getImage(img){
        let attach=AppConsts.attachmentBaseUrl
        return `${attach}/${img}`
    }

    downloadFile(url, name) {

        let attach= AppConsts.attachmentBaseUrl // from app config
     //let fullURL = `${url}`; // FOR Local Use
       let fullURL = `${attach}/${url}`;
        this._downloadService.download(fullURL,
            name);

    }
    // sare End
}
