import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppItemsListsServiceProxy, GetAppItemsListForViewDto, ItemsListFilterTypesEnum } from '@shared/service-proxies/service-proxies';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-app-item-list-card',
  templateUrl: './app-item-list-card.component.html',
  styleUrls: ['./app-item-list-card.component.scss']
})
export class AppItemListCardComponent extends AppComponentBase implements OnInit {

    attachmentBaseUrl :string = AppConsts.attachmentBaseUrl
    @Input() item : GetAppItemsListForViewDto
    @Input() class :string
    @Input() listStatus :string
    @Input('hideActions') hideActions :boolean = false
    @Input('mainFilterType') mainFilterType :ItemsListFilterTypesEnum

    @Input('singleItemPerRowMode') singleItemPerRowMode : boolean
    @Output() deleteMe : EventEmitter<boolean> = new EventEmitter<boolean>()
    @Output() printMe : EventEmitter<boolean> = new EventEmitter<boolean>()
    @Output() unPublishMe : EventEmitter<boolean> = new EventEmitter<boolean>()
    @Output() publishMe : EventEmitter<boolean> = new EventEmitter<boolean>()
    ItemsListFilterTypesEnum  = ItemsListFilterTypesEnum
    canPublish : boolean
    canEdit : boolean
    canPrint : boolean
    canDelete : boolean
    constructor(
        injector:Injector,
        private _appItemsListsServiceProxy: AppItemsListsServiceProxy,
    ){
        super(injector)
    }

    ngOnInit(){
        this.checkPermissions()
    }

    deleteList(){
        if (!this.canDelete) return
        this.deleteMe.emit(true)
    }
    printList(){
        if (!this.canPrint) return
        this.printMe.emit(true)
    }
    getListingShareData(id:number){
        return this._appItemsListsServiceProxy.getPublishOptions(id).toPromise()
    }

    checkPermissions(){
        this.canPublish  = this.permission.isGranted('Pages.AppItemsLists.Publish')
        this.canEdit  = this.permission.isGranted('Pages.AppItemsLists.Edit')
        this.canPrint  = this.permission.isGranted('Pages.AppItemsLists.Print')
        this.canDelete  = this.permission.isGranted('Pages.AppItemsLists.Delete')
    }

    publish(){
        if (!this.canPublish) return
        this.publishMe.emit()
    }

    unPublish(){
        if (!this.canPublish) return
        this.unPublishMe.emit()
    }

}









// public const string Pages_Accounts_Members_List = "Pages.Accounts.Members.List";
// public const string Pages_Accounts_Member_Create = "Pages.Accounts.Member.Create";
// public const string Pages_Accounts_Member_Edit = "Pages.Accounts.Member.Edit";
// public const string Pages_Accounts_Member_Delete = "Pages.Accounts.Member.Delete";


// public const string Pages_Administration_Members_List = "Pages.Administration.Members.List";
//         public const string Pages_Administration_Members_Create = "Pages.Administration.Members.Create";
//         public const string Pages_Administration_Members_Edit = "Pages.Administration.Members.Edit";
//         public const string Pages_Administration_Members_View = "Pages.Administration.Members.View";
//         public const string Pages_Administration_Members_Delete = "Pages.Administration.Members.Delete";
