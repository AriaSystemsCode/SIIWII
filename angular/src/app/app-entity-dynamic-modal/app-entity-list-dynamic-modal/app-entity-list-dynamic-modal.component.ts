import { Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppEntitiesServiceProxy, AppEntityDto, CreateOrEditAppEntityDto, LookupLabelDto } from '@shared/service-proxies/service-proxies';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
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
    selectedRecords: number[] = []
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
    constructor(
        injector: Injector,
        public currentModalRef: BsModalRef,
        private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
    ) {
        super(injector)
    }

    ngOnInit(): void {
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
            undefined,
            this.entityObjectType.code,
            undefined,
            undefined,
            undefined,
            this.sortBy,
            this.skipCount,
            this.maxResultCount,
        )
        .pipe(
            finalize(()=>{
                this.loading = false
                this.active = true;
            })
        )
        .subscribe((result)=>{
            const isLastPage = this.skipCount + this.maxResultCount > this.totalCount
            const isFirstPage = this.skipCount == 0

            if( isFirstPage ) this.allRecords = []
            this.allRecords.push(...result.items);
            this.allRecords.push(...this.nonLookupValues);
            this.displayedRecords = this.allRecords
            this.totalCount = result.totalCount;
            this.showMoreListDataButton = !isLastPage

        })
        this.subscriptions.push(subs)
    }
    showMoreListData() {
        if(!this.showMoreListDataButton) this.showMoreListDataButton = true
        this.skipCount += this.maxResultCount
        this.getAllEntityValuesList()
    }
    openCreateOrEditModal(entityLookup?:LookupLabelDto) : void {

        const appEntity : AppEntityDto = new AppEntityDto()
        if(entityLookup) {
            appEntity.id = entityLookup.value
        }
        this.createOreEditAppEntityModal.codeIsRequired = true
        this.createOreEditAppEntityModal.show(this.entityObjectType,appEntity)
        this.active = false

    }

    onCanceledHandler(){
        this.active = true
    }
    onCreateOrEditDoneHandler(){
        this.resetList()
    }

    resetList(){
        this.skipCount = 0
        this.getAllEntityValuesList()
    }

    close(){
        this.currentModalRef.setClass('right-modal slide-right-out')
        this.selectionDone = false
        this.currentModalRef.hide()
    }

    deleteSycEntityObject(id: number,index:number): void {
        var isConfirmed: Observable<boolean>;
        isConfirmed   = this.askToConfirm("","AreYouSure");
    
       isConfirmed.subscribe((res)=>{
          if(res){
                    this._appEntitiesServiceProxy.delete(id)
                    .subscribe(() => {
                        this.displayedRecords.splice(index,1)
                        const indexInAllRecords = this.allRecords.findIndex(item=>item.value == id)
                        this.allRecords.splice(indexInAllRecords,1)
                        this.notify.success(this.l('SuccessfullyDeleted'));
                    });
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
        /*  this._appEntitiesServiceProxy.converttoLookupLabelDto($event)
        .subscribe((nonLookupValue :LookupLabelDto) => {
            this.nonLookupValues.push(nonLookupValue);
        });  */

     /* var nonLookupValue : LookupLabelDto =new LookupLabelDto();
        nonLookupValue.code =  $event?.code;
        nonLookupValue.label = $event?.name;
        nonLookupValue.hexaCode =$event?.entityExtraData ?  $event?.entityExtraData[0]?.attributeValue : null ;
        var imgName_Type = $event?.entityAttachments ?  $event?.entityAttachments[0]?.fileName?.split('.') : [];
        var imgType =  imgName_Type.length  >0 ?  imgName_Type?.[imgName_Type.length - 1] : "" ;
        nonLookupValue.image ="attachments/-1/" + $event?.entityAttachments[0]?.guid+"."+ imgType;   
        nonLookupValue.value = $event?.objectId;      // ??????????????????????
        nonLookupValue.isHostRecord =  false;
        nonLookupValue.stockAvailability = null; */
    }
}
