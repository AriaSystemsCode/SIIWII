import { Component, ViewChild, Injector, Output, EventEmitter, OnInit} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { TicketNotesServiceProxy, CreateOrEditTicketNoteDto, AttachmentInfoDto, FlatFeatureSelectDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';

import { TicketNoteTicketLookupTableModalComponent } from './ticketNote-ticket-lookup-table-modal.component';
import { AppConsts } from '@shared/AppConsts';
import { FileDownloadService } from "@shared/download/fileDownload.service";
import { FileUploader, FileUploaderOptions, FileItem } from 'ng2-file-upload';
@Component({
    selector: 'createOrEditTicketNoteModal',
    styleUrls:  ["./view-ticketNote-modal.component.scss"],
    templateUrl: './create-or-edit-ticketNote-modal.component.html'
})
export class CreateOrEditTicketNoteModalComponent extends AppComponentBase implements OnInit {


    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('ticketNoteTicketLookupTableModal', { static: true }) ticketNoteTicketLookupTableModal: TicketNoteTicketLookupTableModalComponent;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    ticketNote: CreateOrEditTicketNoteDto = new CreateOrEditTicketNoteDto();

    ticketTicketNumber = '';
    TicketNoteattachments=[];

    public uploader: FileUploader;

    ngOnInit(): void {
        this.initUploaders();

    }

    constructor(
        injector: Injector,
        private _ticketNotesServiceProxy: TicketNotesServiceProxy,private _downloadService: FileDownloadService
    ) {

        super(injector);
    }

    show(ticketNoteId?: number): void {


        if (!ticketNoteId) {
            this.ticketNote = new CreateOrEditTicketNoteDto();
            this.ticketNote.id = ticketNoteId;
            this.ticketTicketNumber = '';
//sara start
           this.TicketNoteattachments=[];
//sara end
            this.active = true;
            this.modal.show();
        } else {
            this._ticketNotesServiceProxy.getTicketNoteForEdit(ticketNoteId).subscribe(result => {
                this.ticketNote = result.ticketNote;
                this.ticketTicketNumber = result.ticketTicketNumber;
                this.active = true;
                this.modal.show();
            });
        }

    }

    save(): void {
            this.saving = true;



            this._ticketNotesServiceProxy.createOrEdit(this.ticketNote)
             .pipe(finalize(() => { this.saving = false;}))
             .subscribe(() => {
               // this.notify.info(this.l('EditedfieldswillnotbesyncwithAutotask'));
               this.notify.info(this.l('SavedSuccessfully') +" , " +this.l('EditedfieldswillnotbesyncwithAutotask')) ;
                this.close();
                this.modalSave.emit(null);
             });
    }

    openSelectTicketModal() {
        this.ticketNoteTicketLookupTableModal.id = this.ticketNote.ticketId;
        this.ticketNoteTicketLookupTableModal.displayName = this.ticketTicketNumber;
        this.ticketNoteTicketLookupTableModal.show();
    }

    setTicketIdNull() {
        this.ticketNote.ticketId = null;
        this.ticketTicketNumber = '';
    }


    getNewTicketId() {
        this.ticketNote.ticketId = this.ticketNoteTicketLookupTableModal.id;
        this.ticketTicketNumber = this.ticketNoteTicketLookupTableModal.displayName;
    }


    close(): void {
        this.active = false;
        this.modal.hide();
    }

      // sara Start
      _handleReaderLoadedAttachment(e) {
        let reader = e.target;
        // this.imageFeaturedImageSrc = reader.result;
        // this.featuredImageControl.setValue(this.imageFeaturedImageSrc)

    }

      handleInputChangeAttachment(e) {

        if (e.target.files.length === 0)
            return;
        var file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
        this.TicketNoteattachments.push(e.target.files[0])
        this.uploader.addToQueue((e.target.files));

        let guid = this.guid();
        this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
            form.append('guid', guid);
        };

        this.uploader.uploadAll();

        var pattern = /image-*/;
        var reader = new FileReader();
        // if (!file.type.match(pattern)) {
        //   alert('invalid format');
        //   return;
        // }
        reader.onload = this._handleReaderLoadedAttachment.bind(this);
        reader.readAsDataURL(file);
        let att: AttachmentInfoDto = new AttachmentInfoDto();
        att.fileName = e.target.files[0].name;
        att.id = 0;  // 0 for new attachments
        att.guid = guid;

        if (this.ticketNote.entityAttachments == null || this.ticketNote.entityAttachments == undefined) {
            this.ticketNote.entityAttachments= [];
        }
        this.ticketNote.entityAttachments.push(att)

    }
      getImage(img){
        let attach=AppConsts.attachmentBaseUrl
        return `${attach}/${img}`
    }

    downloadFile(url, name ,attch : AttachmentInfoDto) {
 if (!attch.guid )
    {     let attach= AppConsts.attachmentBaseUrl // from app config
        //let fullURL = `${url}`; // FOR Local Use
        let fullURL = `${attach}/${url}`;
        this._downloadService.download(fullURL,
            name);
    }
        else {this.notify.warn("Couldn't download not saved file"+ " "+ name)}

    }

    deleteTicketNoteAttachment(id)
    {
        const index: number = this.ticketNote.entityAttachments.indexOf(id);
        this.ticketNote.entityAttachments.splice(index);
    }
    // sare End
}
