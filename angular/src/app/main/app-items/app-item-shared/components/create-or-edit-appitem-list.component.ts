import { AfterViewInit, Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppItemsListsServiceProxy, CreateOrEditAppItemsListDto } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-create-or-edit-appitem-list',
  templateUrl: './create-or-edit-appitem-list.component.html',
  styleUrls: ['./create-or-edit-appitem-list.component.scss'],
  providers:[AppItemsListsServiceProxy]
})
export class CreateOrEditAppitemListComponent extends AppComponentBase implements AfterViewInit {

    @ViewChild('createOrEditListModal', { static: true }) modal: ModalDirective;
    @Output() createOrEditDone: EventEmitter<number> = new EventEmitter<number>();
    @Output() cancelDone: EventEmitter<number> = new EventEmitter<number>();

    active = false;
    saving = false;
    loading: boolean;

    @Input('listDto') listDto: CreateOrEditAppItemsListDto
    currentlySelectedlistingId:number
    entityObjectType:string ="PRODUCTS-LIST"
    constructor(
        injector: Injector,
        private appItemsListsServiceProxy:AppItemsListsServiceProxy
    ) {
        super(injector);
    }

    ngAfterViewInit(){
        this.modal.config.backdrop = 'static'
        this.modal.config.ignoreBackdropClick = true
    }


    show(listingId?:number): void {
        this.currentlySelectedlistingId = listingId
        this.listDto = new CreateOrEditAppItemsListDto()
        this.active = true;
        this.modal.show();
    }

    emitListCreation(){
        this.createOrEditDone.emit(this.currentlySelectedlistingId);
        this.currentlySelectedlistingId = undefined
        this.hide()
    }


    close(): void {
        this.cancelDone.emit(this.currentlySelectedlistingId)
        this.currentlySelectedlistingId = undefined
        this.hide()
    }

    hide(){
        this.active = false;
        this.modal.hide();
    }

    save(form:NgForm){
        if(form.form.invalid){
            form.form.markAllAsTouched()
            return this.notify.info(this.l("Please,CompleteAllTheRequiredFields(*)"))
        }
        this.loading = true

        this.appItemsListsServiceProxy.createOrEdit(this.listDto)
        .pipe(finalize(()=>this.loading = false))
        .subscribe((res)=>{
            // this.notify.success(this.l("AddedSuccessfully"))
            this.hide()
            this.emitListCreation()
        })
    }
    getCodeValue(code: string) {
        this.listDto.code= code;
    }

}
