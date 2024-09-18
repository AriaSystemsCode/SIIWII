import { Component, ViewChild, Injector, Output, EventEmitter, OnInit } from '@angular/core';
import { AccountsServiceProxy, ContactDto, ContactForEditDto, SycAttachmentCategoryDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { NgImageSliderComponent } from 'ng-image-slider';
import { AppConsts } from '@shared/AppConsts';


import { finalize } from 'rxjs/operators';
import { ViewMemberProfileComponentInputsI } from '../../models/view-member-profile-model';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Observable } from 'rxjs';


@Component({
    selector: 'app-view-member-profile',
    templateUrl: './view-member-profile.component.html',
    styleUrls: ['./view-member-profile.component.scss'],
    animations: [appModuleAnimation()]
})
export class ViewMemberProfileComponent extends AppComponentBase implements OnInit {
   
    editMode = false;
    @ViewChild('nav') slider: NgImageSliderComponent;
    memberData: ContactForEditDto;


    @Output() edit: EventEmitter<number> = new EventEmitter<number>()
    @Output() delete: EventEmitter<number> = new EventEmitter<number>()


    canEdit: boolean;
    canDelete: boolean;
    canView: boolean;

    attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;
    logoPhoto: string
    coverPhoto: string
    title: string
    contactDisplayName: string
    active = false;

    logoDefaultImage = "../../../assets/placeholders/_logo-placeholder.png"
    coverDefaultImage = "../../../assets/placeholders/_default_cover.jpg"
    sycAttachmentCategoryLogo: SycAttachmentCategoryDto
    sycAttachmentCategoryBanner: SycAttachmentCategoryDto

    constructor(injector: Injector, private _AccountsServiceProxy: AccountsServiceProxy) {
        super(injector);
    }
    ngOnInit() {
        this.getAllAttachmentCategories()
    }
    editInfo = true;
    NoteditInfo = false;
    editMember() {
        debugger
        //this.memberData?.contact.eMailAddress
        if (this.memberData?.contact.userName.includes("admin")) {
            this.editInfo=false;
            this.NoteditInfo=true;
            //this.memberData?.contact.jobTitle = "lol";
        } else {
            const memberId: number = this.memberData?.contact?.id;
            if (isNaN(memberId)) return
            this.edit.emit(memberId);
        }
    }
    deleteMember() {
        const memberId: number = this.memberData?.contact?.id;
        if (isNaN(memberId)) return
        var isConfirmed: Observable<boolean>;
        isConfirmed = this.askToConfirm("AreYouSureYouWantToDeleteThisContact?", "AreYouSure");

        isConfirmed.subscribe((res) => {
            if (res) {
                this.delete.emit(memberId)
            }
        }
        );
    }

    show(input: ViewMemberProfileComponentInputsI) {
        this.canDelete = input.canDelete
        this.canEdit = input.canEdit
        this.title = input.title
        this.showMainSpinner()

        this._AccountsServiceProxy.getContactForView(input.id)
            .pipe(finalize(() => {
                this.hideMainSpinner()
                this.active = true

            }))
            .subscribe((result) => {
                this.memberData = result;
                const firstName = this.memberData.contact.firstName
                const lastName = this.memberData.contact.lastName
                this.contactDisplayName = firstName ? firstName : ""
                this.contactDisplayName += lastName ? " " + lastName : ""
                if (this.memberData?.imageUrl) this.logoPhoto = this.attachmentBaseUrl + '/' + this.memberData?.imageUrl;
                if (this.memberData?.coverUrl) this.coverPhoto = this.attachmentBaseUrl + '/' + this.memberData?.coverUrl;
            });
    }

    hide() {
        this.active = false
        this.memberData = undefined
        this.canDelete = undefined
        this.canEdit = undefined
        this.canView = undefined
    }

    getAllAttachmentCategories() {
        this.getSycAttachmentCategoriesByCodes(['LOGO', "BANNER"]).subscribe((result) => {
            result.forEach(item => {
                if (item.code == "LOGO") this.sycAttachmentCategoryLogo = item
                else if (item.code == "BANNER") this.sycAttachmentCategoryBanner = item
            })
        })

    }
    CreateUserName() {
        debugger
    }
    Save_editMember(){
        debugger
        this.editInfo=false;
        this.NoteditInfo=true;
        let accountInfo=this.memberData?.contact;
       //accountInfoTemp
        //this._AccountsServiceProxy.createOrEditMyAccount(accountInfo)
    }
}
