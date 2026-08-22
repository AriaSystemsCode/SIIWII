import { Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppEntitiesServiceProxy, AppEntityDto, CreateOrEditAppEntityDto, LookupLabelDto } from '@shared/service-proxies/service-proxies';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { BsDropdownDirective } from 'ngx-bootstrap/dropdown';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { CreateOrEditAppEntityDynamicModalComponent } from '../create-or-edit-app-entity-dynamic-modal/create-or-edit-app-entity-dynamic-modal.component';

@Component({
  selector: 'app-app-entity-list-dynamic-modal',
  templateUrl: './app-entity-list-dynamic-modal.component.html',
  styleUrls: ['./app-entity-list-dynamic-modal.component.scss']
})
export class AppEntityListDynamicModalComponent extends AppComponentBase implements OnInit {
    @ViewChild("createOreEditAppEntityModal",{static : true}) createOreEditAppEntityModal : CreateOrEditAppEntityDynamicModalComponent
    acceptMultiValues : boolean = true
    showAddAction : boolean = true
    showActions : boolean  = true
    createOrEditModalRef : BsModalRef
    allRecords : LookupLabelDto[]= []
    displayedRecords : LookupLabelDto[]= []
    selectedRecords: (string | number)[] = []
    active : boolean = false;
    loading : boolean;
    entityObjectType : { code:string, name:string }
    changesApplied : boolean = false
    selectionDone : boolean = false
    maxResultCount : number = 10
    skipCount : number = 0
    sortBy : string = "name"
    totalCount : number
    showMoreListDataButton : boolean
    searchQuery:string
    searchSubj:Subject<string>=new Subject<string>()
    nonLookupValues:LookupLabelDto[];
    currentLang: string
    isArabic: boolean
    constructor(
        injector: Injector,
        public currentModalRef: BsModalRef,
        private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
    ) {
        super(injector)
    }

    ngOnInit(): void {
        this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName')
        this.currentLang == 'ar' || this.currentLang == 'ar-EG'  ? this.isArabic = true : this.isArabic = false
        this.getAllEntityValuesList()
        this.searchSubj
        .pipe(
            debounceTime(300),
            distinctUntilChanged()
        )
        .subscribe(()=>{
            this.resetList()
        })
    }

    getAllEntityValuesList(){
        this.loading = true

        const subs = this._appEntitiesServiceProxy.getAllEntitiesByTypeCodeWithPaging(
            undefined,
            this.searchQuery,
            undefined,
            undefined,
            undefined,false,
            this.entityObjectType.code,
            undefined,
            undefined,
            undefined,
            this.sortBy,
            this.skipCount,
            this.maxResultCount
        )
        .pipe(
            finalize(()=>{
                this.loading = false
                this.active = true;
            })
        )
        .subscribe((result)=>{
            this.totalCount = result.totalCount;
            const isLastPage = this.skipCount + this.maxResultCount > this.totalCount
            const isFirstPage = this.skipCount == 0

            if( isFirstPage ) this.allRecords = []
                    // Filter out any result items already present in allRecords
            const newItems = result.items.filter(newItem =>
                !this.allRecords.some(existing => existing.code === newItem.code)
            );
            this.allRecords.push(...newItems);

            // Add nonLookupValues without duplicating existing ones
            this.nonLookupValues = this.nonLookupValues || [];
            const uniqueNonLookup = this.nonLookupValues.filter(nonLookup =>
                !this.allRecords.some(existing => existing.code === nonLookup.code)
            );
            this.allRecords.push(...uniqueNonLookup);

            this.displayedRecords = this.allRecords;

           
            this.showMoreListDataButton = !isLastPage

        })
        this.subscriptions.push(subs)
    }
    showMoreListData() {
        if(!this.showMoreListDataButton) this.showMoreListDataButton = true
        this.skipCount += this.maxResultCount
        this.getAllEntityValuesList()
    }

    isNonLookupValue(itemCode){
        if(this?.nonLookupValues.filter(nonLookup =>nonLookup.code==itemCode)?.length >=1)
        return true;

        else
        return false;
    }
    openCreateOrEditModal(entityLookup?:LookupLabelDto, dropdown?: BsDropdownDirective) : void {

        this.closeActionsDropdown(dropdown)

        let appEntity : AppEntityDto = new AppEntityDto()
        if(entityLookup){
       // if(entityLookup.value ) {
            if(!(this?.nonLookupValues.filter(nonLookup =>nonLookup.code==entityLookup.code)?.length >=1)) {
            appEntity.id = entityLookup.value;
            this.showCreateOreEditAppEntityModal(appEntity,false)
        }

        else {
            this._appEntitiesServiceProxy.convertAppLookupLabelDtoToEntityDto(entityLookup)
            .subscribe((result :AppEntityDto) => {
                appEntity=result;
                this.showCreateOreEditAppEntityModal(appEntity,true)
            }); 
        }
    }

    else
    this.showCreateOreEditAppEntityModal(appEntity,false);

    }

    showCreateOreEditAppEntityModal(appEntity,nonlookup) {
        this.createOreEditAppEntityModal.codeIsRequired = true
        this.createOreEditAppEntityModal.show(this.entityObjectType,appEntity,nonlookup)
        this.active = false
    }

    onCanceledHandler(){
        this.active = true
    }

    closeActionsDropdown(dropdown?: BsDropdownDirective): void {
        if (dropdown?.isOpen) {
            dropdown.hide();
        }
    }

    onCreateOrEditDoneHandler(){
        this.resetList()
    }

    resetList(){
        this.skipCount = 0
        this.getAllEntityValuesList()
    }

    close(){
        this.currentModalRef.setClass(
            this.isArabic
                ? 'left-modal slide-left-out ngLeft'
                : 'right-modal slide-right-out'
        )
        this.selectionDone = false
        this.currentModalRef.hide()
    }

    deleteSycEntityObject(_item,index:number, dropdown?: BsDropdownDirective): void {
        this.closeActionsDropdown(dropdown)

        var isConfirmed: Observable<boolean>;
        isConfirmed   = this.askToConfirm("","AreYouSure");
    
       let  id=_item.value ? _item.value :0

       isConfirmed.subscribe((res)=>{
          if(res){
            if(id){
                    this._appEntitiesServiceProxy.delete(id)
                    .subscribe(() => {
                        this.displayedRecords.splice(index,1)
                        const indexInAllRecords = this.allRecords.findIndex(item=>item.value == id)
                        this.allRecords.splice(indexInAllRecords,1)
                        const _indexInAllRecords = this.nonLookupValues.findIndex(item=>item.value == id)
                        this.nonLookupValues.splice(_indexInAllRecords,1)
                        this.notify.success(this.l('SuccessfullyDeleted'));
                    });
                }
                else{
                    this.displayedRecords.splice(index,1)
                    const indexInAllRecords = this.allRecords.findIndex(item=>item.code == _item.code)
                    this.allRecords.splice(indexInAllRecords,1)
                    const _indexInAllRecords = this.nonLookupValues.findIndex(item=>item.code == _item.code)
                    this.nonLookupValues.splice(_indexInAllRecords,1)
                    this.notify.success(this.l('SuccessfullyDeleted'));
                }
            }
            }
        );
    }
    onFilter(){
        this.searchSubj.next(this.searchQuery)
    }

    submitSelection(){
        this.selectionDone = true
        this.currentModalRef.hide()
    }

    onAddNonLookupValues($event:AppEntityDto){

         this._appEntitiesServiceProxy.convertAppEntityDtoToLookupLabelDto($event)
        .subscribe((nonLookupValues :LookupLabelDto) => {
            if(!$event?.id){
                if(!$event.nonlookup){
    let nonLookupIndx = this.nonLookupValues.findIndex(x=>x.code==nonLookupValues.code);
    let selectedRecordIndx = this.selectedRecords.findIndex(x=>x==nonLookupValues.code);

    if(nonLookupIndx>=0){
        if(selectedRecordIndx>=0)
            this.selectedRecords[selectedRecordIndx]=$event.value

        this.nonLookupValues.splice(nonLookupIndx,1);
    }
}

                    else
            this.nonLookupValues.push(nonLookupValues);
            }
            

            else{
                let x = this.nonLookupValues.filter(x=>x.code==nonLookupValues.code);
                if(x && x.length>0)
                 {
                     x[0].hexaCode=nonLookupValues.hexaCode;
                     x[0].image=nonLookupValues.image;
                     x[0].label=nonLookupValues.label;
                     x[0].value=nonLookupValues.value;
                 }
            }
        }); 
    }

}
