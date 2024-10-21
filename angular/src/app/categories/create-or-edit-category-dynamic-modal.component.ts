import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CreateOrEditSycEntityObjectCategoryDto,  SycEntityObjectCategoriesServiceProxy } from '@shared/service-proxies/service-proxies';
import { MessageService } from 'abp-ng2-module';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-create-or-edit-category-dynamic-modal',
  templateUrl: './create-or-edit-category-dynamic-modal.component.html',
  styleUrls: ['./create-or-edit-category-dynamic-modal.component.scss']
})
export class CreateOrEditCategoryDynamicModalComponent extends AppComponentBase implements OnInit {
    changesApplied : boolean = false
    category : CreateOrEditSycEntityObjectCategoryDto
    createOrEditModalRef : BsModalRef
    active : boolean = true;
    saving : boolean = false;
    loading : boolean;
    parentCategory : CreateOrEditSycEntityObjectCategoryDto
    @ViewChild('categoryForm',{ static: true }) categoryForm : NgForm
    entityObjectType:string ="CATEGORY"
    constructor(
        injector: Injector,
        public currentModalRef: BsModalRef,
        private _sycEntityObjectCategoriesServiceProxy: SycEntityObjectCategoriesServiceProxy,
        private messageService : MessageService
    ) {
        super(injector)
    }

    ngOnInit(): void {
        if(!this.category) {
            this.category = new CreateOrEditSycEntityObjectCategoryDto()
        }
        this.categoryForm.valueChanges.subscribe(value=>{
            if(this.categoryForm.dirty)  this.formTouched = true
        })
    }

    close(){
        this.currentModalRef.setClass('right-modal slide-right-out')
        this.changesApplied = false
        this.currentModalRef.hide()
        this.categoryForm.reset()
    }

    async saveCategory(form:NgForm){
        if(form.invalid) {
            this.notify.error(this.l('PleaseCompleteAllTheRequiredFields'))
            return form.form.markAllAsTouched()
        }
        const save = ()=>{
            this._sycEntityObjectCategoriesServiceProxy.createOrEditForObjectProduct(this.category)
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
        if(this.category?.code)
        this.category.code= code;
    }
    checkNameExistance(){
        return this._sycEntityObjectCategoriesServiceProxy.categoryNameIsExisting(this.category.name).toPromise()
    }
}