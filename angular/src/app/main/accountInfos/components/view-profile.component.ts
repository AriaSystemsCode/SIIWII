import { Component, ViewChild, Injector, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { AccountDto, AccountLevelEnum, AccountsServiceProxy, AppEntitiesServiceProxy, CreateOrEditAccountInfoDto, SycAttachmentCategoryDto, AccountInfoAppService_oldServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { NgImageSliderComponent } from 'ng-image-slider';
import { AppConsts } from '@shared/AppConsts';
import { SelectItem } from 'primeng/api';
import { ImageObject } from '../../accounts/account-shared/models/imageobject';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { finalize } from 'rxjs';
import { PublishAccountService } from '../services/publishAccountService';


@Component({
    selector: 'app-view-profile',
    styleUrls: ['./view-profile.component.scss'],
    templateUrl: './view-profile.component.html',
    animations: [appModuleAnimation()]
})
export class ViewProfileComponent extends AppComponentBase implements OnChanges, OnInit {

    @ViewChild('nav') slider: NgImageSliderComponent;
    @Input('accountData') accountData: AccountDto;
    @Input('isPublished') isPublished: boolean;
    @Input() viewMode: boolean;
    @Input() accountLevel: AccountLevelEnum;
   // @Input('connections') appEntityName: string;
    showEditConnected: boolean = false;
    priceLevel: string;
    allPriceLevel: SelectItem[] = [];

    @Output("edit") edit: EventEmitter<boolean> = new EventEmitter<boolean>()
    @Output("delete") delete: EventEmitter<boolean> = new EventEmitter<boolean>()
    @Output("publish") publish: EventEmitter<boolean> = new EventEmitter<boolean>()
    @Output("unPublish") unPublish: EventEmitter<boolean> = new EventEmitter<boolean>()
    // @Output("private") private: EventEmitter<boolean> = new EventEmitter<boolean>()
    //  @Output("hide") hide: EventEmitter<boolean> = new EventEmitter<boolean>()

    accountLevelEnum = AccountLevelEnum;
    attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;
    active = false;
    saving = false;
    coverPhoto: any = ""
    logoPhoto: any = ""
    accountType: any;
    imageObject: ImageObject[] = [];
    allAccountTypes: SelectItem[] = []
    //Department
    showMoreDepartment: boolean = false;
    showLessDepartment: boolean = false;
    totalDepartment: number;
    noOfDepartmentToShowInitially: number;
    maxDepartmentCount: number;
    skipDepartmentCount: number;
    departmentToLoad: number;
    initDepartment: string[] = [];
    scrollDepartment: boolean = false;
    maxDepartmentCnt: number;
    //Classification
    showMoreClassification: boolean = false;
    showLessClassification: boolean = false;
    totalClassification: number;
    noOfClassificationToShowInitially: number;
    maxClassificationCount: number;
    skipClassificationCount: number;
    classificationToLoad: number;
    initClassification: string[] = [];
    scrollClassification: boolean = false;
    maxClassificationCnt: number;
    maxContainerHeight: number = 150;
    sycAttachmentCategoryLogo: SycAttachmentCategoryDto
    sycAttachmentCategoryBanner: SycAttachmentCategoryDto
    sycAttachmentCategoryImage: SycAttachmentCategoryDto
    btnLoader: boolean = false;
    constructor(
        injector: Injector,
        private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
        private _AccountsServiceProxy: AccountsServiceProxy,
        private _publishAccountService: PublishAccountService,
        // private _accountInfoAppService_oldServiceProxy:AccountInfoAppService_oldServiceProxy,

    ) {
        super(injector)
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.accountData) {
            this.handleAccountData()
            this.initDepartmentVariables(true);
            this.initClassificationVariables(true);
        }
    }
    ngOnInit() {
        this.getAllForAccountInfo()
        this.allPriceLevel = this.getPriceLevel();
        this.allPriceLevel.push({ label: 'MSRP', value: 'MSRP' });
    }
    handleInvalidImages(event) {
    }
    prevImageClick() {
        this.slider.prev();
    }

    nextImageClick() {
        this.slider.next();
    }

    handleAccountData() {
        this.accountData.isConnected = this.accountData.status;
        if (this.accountData.isConnected)
            this.showEditConnected = true;
        else
            this.showEditConnected = false;

        this.priceLevel = this.accountData.priceLevel;
        if (this.accountData.coverUrl) this.coverPhoto = `${this?.attachmentBaseUrl}/${this?.accountData?.coverUrl}`;
        if (this.accountData.logoUrl) this.logoPhoto = `${this?.attachmentBaseUrl}/${this?.accountData?.logoUrl}`;

        for (let index = 0; index < this.accountData?.imagesUrls?.length; index++) {
            const element = this.accountData.imagesUrls[index];
            let object = {
                image: `${this.attachmentBaseUrl}/${element}`,
                thumbImage: `${this.attachmentBaseUrl}/${element}`,
                title: ''
            }
            this.imageObject.push(object);
        }
        this.accountType = this.allAccountTypes.find(x => x.value == this.accountData.accountType)
    }
    editAccount() {
        this.edit.emit()
    }

    deleteAccount() {
        this.delete.emit()
    }
    //Department
    initDepartmentVariables(firstInit: boolean) {
        if (firstInit)
            this.initDepartment = this.accountData.categories;
        else this.accountData.categories = this.initDepartment;

        this.noOfDepartmentToShowInitially = 10;
        this.maxDepartmentCount = 10;
        this.scrollDepartment = false;
        this.maxDepartmentCnt = 40;
        this.departmentToLoad = 20;
        this.totalDepartment =
            this.accountData.categoriesTotalCount;

        if (this.noOfDepartmentToShowInitially < this.totalDepartment)
            this.showMoreDepartment = true;
        else this.showMoreDepartment = false;
        this.showLessDepartment = false;
    }

    showDepartment() {
        if (this.noOfDepartmentToShowInitially < this.totalDepartment) {
            this.maxDepartmentCount = this.departmentToLoad;
            this.skipDepartmentCount = this.noOfDepartmentToShowInitially;
            this.noOfDepartmentToShowInitially += this.departmentToLoad;

            this._appEntitiesServiceProxy
                .getAppEntityDepartmentsNamesWithPaging(
                    this.accountData.entityId,
                    undefined,
                    this.skipDepartmentCount,
                    this.maxDepartmentCount,
                )
                .subscribe((res) => {
                    if (
                        this.noOfDepartmentToShowInitially >=
                        this.totalDepartment
                    ) {
                        this.showMoreDepartment = false;
                        this.showLessDepartment = true;
                    }

                    this.accountData.categories =
                        this.accountData.categories.concat(
                            res.items
                        );
                    if (
                        this.accountData.categories.length >= this.maxDepartmentCnt
                    )
                        this.scrollDepartment = true;
                });
        } else {
            this.initDepartmentVariables(false);
        }
    }

    //Classification
    initClassificationVariables(firstInit: boolean) {
        if (firstInit)
            this.initClassification = this.accountData.classfications
        else this.accountData.classfications = this.initClassification;

        this.noOfClassificationToShowInitially = 10;
        this.maxClassificationCount = 10;
        this.scrollClassification = false;
        this.maxClassificationCnt = 40;
        this.classificationToLoad = 20;
        this.totalClassification = this.accountData.classificationsTotalCount;
        if (this.noOfClassificationToShowInitially < this.totalClassification)
            this.showMoreClassification = true;
        else this.showMoreClassification = false;
        this.showLessClassification = false;
    }

    showClassification() {
        if (this.noOfClassificationToShowInitially < this.totalClassification) {
            this.maxClassificationCount = this.classificationToLoad;
            this.skipClassificationCount =
                this.noOfClassificationToShowInitially;
            this.noOfClassificationToShowInitially += this.classificationToLoad;

            this._appEntitiesServiceProxy
                .getAppEntityClassificationsNamesWithPaging(
                    this.accountData.entityId,
                    undefined,
                    this.skipDepartmentCount,
                    this.maxDepartmentCount,
                )
                .subscribe((res) => {
                    if (
                        this.noOfClassificationToShowInitially >=
                        this.totalClassification
                    ) {
                        this.showMoreClassification = false;
                        this.showLessClassification = true;
                    }

                    this.accountData.classfications = this.accountData.classfications.concat(
                        res.items
                    );
                    if (
                        this.accountData.classfications.length >= this.maxClassificationCnt
                    )
                        this.scrollClassification = true;
                });
        } else {
            this.initClassificationVariables(false);
        }
    }

    getAllForAccountInfo() {
        this.getSycAttachmentCategoriesByCodes(['LOGO', "BANNER", "IMAGE"]).subscribe((result) => {
            result.forEach(item => {
                if (item.code == "LOGO") this.sycAttachmentCategoryLogo = item
                else if (item.code == "BANNER") this.sycAttachmentCategoryBanner = item
                else if (item.code == "IMAGE") this.sycAttachmentCategoryImage = item
            })
        })

    }
    publishProfile() {
        this.publish.emit(true);
    }

    unPublishProfile() {
        this.unPublish.emit(true);
    }


    editConnnectedAccount() {
        this.showMainSpinner();

        /*  let createOrEditAccountInfoDto:CreateOrEditAccountInfoDto=new CreateOrEditAccountInfoDto();
         createOrEditAccountInfoDto.accountType=this.accountData.accountType;
         createOrEditAccountInfoDto.accountTypeId=this.accountData.accountTypeId;
         createOrEditAccountInfoDto.attachmentSourceTenantId=this.accountData.attachmentSourceTenantId;
         createOrEditAccountInfoDto.branches=this.accountData.branches;
         createOrEditAccountInfoDto.code=this.accountData.code;
         createOrEditAccountInfoDto.contactAddresses=this.accountData.contactAddresses;
         createOrEditAccountInfoDto.contactPaymentMethods=this.accountData.contactPaymentMethods;
         createOrEditAccountInfoDto.currencyId=this.accountData.currencyId;
         createOrEditAccountInfoDto.eMailAddress=this.accountData.eMailAddress;
         createOrEditAccountInfoDto.entityAttachments=this.accountData.entityAttachments;
         createOrEditAccountInfoDto.entityClassifications=this.accountData.entityClassifications;
         createOrEditAccountInfoDto.entityId=this.accountData.entityId;
         createOrEditAccountInfoDto.id=this.accountData.id;
         createOrEditAccountInfoDto.languageId=this.accountData.languageId;
         createOrEditAccountInfoDto.name=this.accountData.name ?this.accountData.name : this.appSession.tenant.name ;
         createOrEditAccountInfoDto.notes=this.accountData.notes;
         createOrEditAccountInfoDto.phone1Ex=this.accountData.phone1Ex;
         createOrEditAccountInfoDto.phone1Number=this.accountData.phone1Number;
         createOrEditAccountInfoDto.phone1TypeId=this.accountData.phone1TypeId;
         createOrEditAccountInfoDto.phone2Ex=this.accountData.phone2Ex;
         createOrEditAccountInfoDto.phone2Number=this.accountData.phone2Number;
         createOrEditAccountInfoDto.phone2TypeId=this.accountData.phone2TypeId;
         createOrEditAccountInfoDto.phone3Ex=this.accountData.phone3Ex;
         createOrEditAccountInfoDto.phone3Number=this.accountData.phone3Number;
         createOrEditAccountInfoDto.phone3TypeId=this.accountData.phone3TypeId;
         createOrEditAccountInfoDto.priceLevel=this.priceLevel;
         createOrEditAccountInfoDto.ssin=this.accountData.ssin;
         createOrEditAccountInfoDto.tenantId=this.accountData.tenantId ;
         createOrEditAccountInfoDto.tradeName=this.accountData.tradeName ?  this.accountData.tradeName : this.appSession.tenant.name;
         createOrEditAccountInfoDto.website=this.accountData.website;
         createOrEditAccountInfoDto.UseDTOTenant=true; */

        this._AccountsServiceProxy.updateConnectedAccountPriceLevel(this.accountData.id, this.priceLevel)
            .pipe(
                finalize(
                    () => this.hideMainSpinner()
                )
            )
            .subscribe(result => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.showEditConnected = true;
                this.accountData.priceLevel = this.priceLevel;
            });


    }


    openShareAccountsModal() {
        //I40-shareAccount
        // const alreadyShared: boolean = true;
        // const successCallBack = () => {
        //     this.notify.success(this.l("Shared Successfully"));
        // };
        // this._publishAccountService.openAccountSharingModal(
        //     alreadyShared,
        //     successCallBack
        // );
        // this._publishAccountService._accountId = this.accountData.id;
        // this._publishAccountService.screen = 1
        debugger
        this._AccountsServiceProxy.publishProfile(false);
    }

    syncAccount() {
        //I40-syncAccount
        this.btnLoader = true;
        this._AccountsServiceProxy.publishProfile(true);

    }
    UnShareAccount() {
        debugger
        this._AccountsServiceProxy.unPublishProfile();
    }

}
