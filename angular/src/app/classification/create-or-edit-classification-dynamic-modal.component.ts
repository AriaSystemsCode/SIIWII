import { Component, Injector, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CreateOrEditSycEntityObjectClassificationDto,  SycEntityObjectClassificationsServiceProxy } from '@shared/service-proxies/service-proxies';
import { MessageService } from 'abp-ng2-module';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-create-or-edit-classification-dynamic-modal',
  templateUrl: './create-or-edit-classification-dynamic-modal.component.html',
  styleUrls: ['./create-or-edit-classification-dynamic-modal.component.scss']
})
export class CreateOrEditClassificationDynamicModalComponent extends AppComponentBase implements OnInit {

    changesApplied : boolean = false
    classification : CreateOrEditSycEntityObjectClassificationDto
    createOrEditModalRef : BsModalRef
    active : boolean = true;
    saving : boolean = false;
    loading : boolean;
    parentClassification : CreateOrEditSycEntityObjectClassificationDto
    entityObjectType:string ="CLASSIFICATION"
    constructor(
        injector: Injector,
        public currentModalRef: BsModalRef,
        private _sycEntityObjectClassificationsServiceProxy: SycEntityObjectClassificationsServiceProxy,
        private messageService : MessageService
    ) {
        super(injector)

    }

    ngOnInit(): void {

        if(!this.classification) {
            this.classification = new CreateOrEditSycEntityObjectClassificationDto()
        }
        if(this.parentClassification && this.parentClassification.id ) {
            this.classification.parentId = this.parentClassification.id
        }
    }

    close(){
        this.currentModalRef.setClass('right-modal slide-right-out')
        this.changesApplied = false
        this.currentModalRef.hide()
    }

    async saveClassification(form:NgForm){
        if(form.invalid) {
            this.notify.error(this.l('PleaseCompleteAllTheRequiredFields'))
            return form.form.markAllAsTouched()
        }
        const save = ()=>{
            this._sycEntityObjectClassificationsServiceProxy.createOrEditForObjectProduct(this.classification)
            .subscribe((res)=>{
                this.notify.success(this.l('SavedSuccessfully'))
                this.changesApplied = true
                this.currentModalRef.hide()
            })
        }
        const nameAlreadyExist = await this.checkNameExistance()
        if(nameAlreadyExist){
            await this.askToConfirm(
                "",
                this.l("ThisNameAlreadyExists!"),
                {
                    cancelButtonText:this.l('Re-enter'),
                    confirmButtonText:this.l('Proceed')
                }
            )
            .subscribe(isConfirmed=>{
                if(isConfirmed)  save()
            })
        } else {
            save();
        }
    }
    
    getCodeValue(code: string) {
        this.classification.code= code;
    }
    checkNameExistance(){
        return this._sycEntityObjectClassificationsServiceProxy.classificationNameIsExisting(this.classification.name).toPromise()
    }
}
