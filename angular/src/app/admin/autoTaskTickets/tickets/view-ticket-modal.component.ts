import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetTicketForViewDto, TicketDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { FileDownloadService } from '@shared/download/fileDownload.service';

@Component({
    selector: 'viewTicketModal',
    styleUrls:  ["./view-ticket-modal.component.scss"],
    templateUrl: './view-ticket-modal.component.html'
})
export class ViewTicketModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetTicketForViewDto;


    constructor(
        injector: Injector,private _downloadService: FileDownloadService
    ) {
        super(injector);
        this.item = new GetTicketForViewDto();
        this.item.ticket = new TicketDto();
    }

    show(item: GetTicketForViewDto): void {
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
      // let fullURL = `${url}`; // FOR Local Use
        let fullURL = `${attach}/${url}`;
        this._downloadService.download(fullURL,
            name);

    }
    // sare End
}
