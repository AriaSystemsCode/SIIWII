import { Component, ViewChild, Injector, Output, EventEmitter, OnInit} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { TicketsServiceProxy, CreateOrEditTicketDto, AttachmentInfoDto ,AutotaskQueuesServiceProxy, LookupLabelDto, GetAutotaskQueueForViewDto, FlatFeatureSelectDto} from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';
import { AppConsts } from '@shared/AppConsts';
import { FileDownloadService } from "@shared/download/fileDownload.service";
import { FileUploader, FileUploaderOptions, FileItem } from 'ng2-file-upload';
import { SelectItem } from 'primeng';

@Component({
    selector: 'createOrEditTicketModal',
    styleUrls:  ["./view-ticket-modal.component.scss"],
    templateUrl: './create-or-edit-ticket-modal.component.html'
})
export class CreateOrEditTicketModalComponent extends AppComponentBase  implements OnInit{

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    ticket: CreateOrEditTicketDto = new CreateOrEditTicketDto();


    ticketAttachments= [];
    public uploader: FileUploader;
    private _uploaderOptions: FileUploaderOptions = {};
    ngOnInit(): void {
        this.initUploaders();


    }

    constructor(
        injector: Injector,
        private _ticketsServiceProxy: TicketsServiceProxy,
        private _downloadService: FileDownloadService,
        private _AutotaskQueuesServiceProxy : AutotaskQueuesServiceProxy
    ) {
        super(injector);
        this.getQueueTypes();

    }

    show(ticketId?: number): void {

        if (!ticketId) {
            this.ticket = new CreateOrEditTicketDto();
            this.ticket.id = ticketId;
            this.ticketAttachments=[];


            this.active = true;
            this.modal.show();
        } else {

                this._ticketsServiceProxy.getTicketForEdit(ticketId).subscribe(result => {
                this.ticket = result.ticket;
                this.active = true;
                this.modal.show();
            });
        }

    }

    save(): void {
            this.saving = true;

            this._ticketsServiceProxy.createOrEdit(this.ticket)
             .pipe(finalize(() => { this.saving = false;}))
             .subscribe(() => {
                //this.notify.info(this.l('EditedfieldswillnotbesyncwithAutotask'));
                setTimeout(()=>this.notify.info(this.l('SavedSuccessfully') +" , " +this.l('EditedfieldswillnotbesyncwithAutotask')) ,2000) ;
                // setTimeout(()=>this.notify.info(this.l('SavedSuccessfully')),2000) ;
                this.close();
                this.modalSave.emit(null);
             });
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
          this.ticketAttachments.push(e.target.files[0]);
          this.uploader.addToQueue((e.target.files));

          let guid = this.guid();
          this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
              form.append('guid', guid);
          };

          this.uploader.uploadAll();

          var pattern = /image-*/;
          var reader = new FileReader();
          reader.onload = this._handleReaderLoadedAttachment.bind(this);
          reader.readAsDataURL(file);
          let att: AttachmentInfoDto = new AttachmentInfoDto();
          att.fileName = e.target.files[0].name;
          att.id = 0;  // 0 for new attachments
          att.guid = guid;

          if (this.ticket.entityAttachments == null || this.ticket.entityAttachments == undefined) {
              this.ticket.entityAttachments= [];
          }
          this.ticket.entityAttachments.push(att)

      }
        getImage(img){
          let attach=AppConsts.attachmentBaseUrl
          return `${attach}/${img}`
      }

      downloadFile(url, name ,attachItem : AttachmentInfoDto ) {
        if (!attachItem.guid )
           {     let attach= AppConsts.attachmentBaseUrl // from app config
               //let fullURL = `${url}`; // FOR Local Use
               let fullURL = `${attach}/${url}`;
               this._downloadService.download(fullURL,
                   name);
           }
               else {this.notify.warn("Couldn't download not saved file"+ " "+ name)}

           }


      deleteTicketAttachment(id)
      {
          const index: number = this.ticket.entityAttachments.indexOf(id)
          this.ticket.entityAttachments.splice(index);
      }
      allQueueTypes: SelectItem[] = []
      getQueueTypes(){

            this._AutotaskQueuesServiceProxy.getAll().subscribe(result => {
                result.forEach(element => {
                    this.allQueueTypes.push({ label :element.autotaskQueue.name ,value: element.autotaskQueue.refQueueID });

                });

       });


    }
      // sare End
}
