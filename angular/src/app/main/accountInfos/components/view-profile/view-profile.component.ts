import { Component, ViewChild, Injector, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { AccountDto, AccountLevelEnum, AccountsServiceProxy, AppEntitiesServiceProxy, LookupLabelDto, SycAttachmentCategoryDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { NgImageSliderComponent } from 'ng-image-slider';
import { AppConsts } from '@shared/AppConsts';
import { SelectItem } from 'primeng/api';
import { ImageObject } from '../../../accounts/account-shared/models/imageobject';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { finalize } from 'rxjs';


@Component({
    selector: 'app-view-profile',
    styleUrls: ['./view-profile.component.scss'],
    templateUrl: './view-profile.component.html',
    animations: [appModuleAnimation()]
})
export class ViewProfileComponent extends AppComponentBase implements OnChanges, OnInit {

    @ViewChild('nav') slider: NgImageSliderComponent;
    @Input('accountData') accountData: AccountDto;
    @Input('contactData') contactData: AccountDto;
    
    @Input('isPublished') isPublished: boolean;
    @Input('isSync') isSync: boolean;

    @Input('connectionCount') connectionCount: number;
    @Input() viewMode: boolean;
    @Input() accountLevel: AccountLevelEnum;
    @Input() personalAccount = false;

    @Output("edit") edit: EventEmitter<boolean> = new EventEmitter<boolean>()
    @Output("editedData") editedData: EventEmitter<any> = new EventEmitter<any>()
    @Output("editedContactData") editedContactData: EventEmitter<any> = new EventEmitter<any>()
    @Output("delete") delete: EventEmitter<boolean> = new EventEmitter<boolean>()
    @Output("publish") publish: EventEmitter<boolean> = new EventEmitter<boolean>()
    @Output("unPublish") unPublish: EventEmitter<boolean> = new EventEmitter<boolean>()

    showEditConnected: boolean = false;
    priceLevel: string;
    allPriceLevel: SelectItem[] = [];

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
    editInfo = true;
    NoteditInfo = false;
    editFirstNameValue: string = '';
    editLastNameValue: string = '';
    editJobTitleValue: string = '';
    editEMailAddressValue: string = '';
    editLanguageNameValue: string = '';
    editPhoneNumberValue: string = '';
    Editting: boolean = false;
    editPersonal: boolean = false;
    showPrivate = true;

    showHide = true;
    hidUshare = false;
    showIsSync = false;
    showShare = true;
    hideshowShare = false;
    editedPersonalData:any
        allLanguages: LookupLabelDto[];
        isRecordOwner:boolean
    constructor(
        injector: Injector,
        private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
        private _AccountsServiceProxy: AccountsServiceProxy,
    ) {
        super(injector)
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.accountData) {
            this.handleAccountData()
            this.initDepartmentVariables(true);
            this.initClassificationVariables(true);
            this.getContactSync();
            this.getLanguages()
            this.isRecordOwner = this.accountData?.id == this.appSession.user?.accountId ? true : false
        }

    }
    ngOnInit() {
        this.getAllForAccountInfo()
        this.allPriceLevel = this.getPriceLevel();
        this.allPriceLevel.push({ label: 'MSRP', value: 'MSRP' });

    
    
    }

    prevImageClick() {
        this.slider.prev();
    }

    nextImageClick() {
        this.slider.next();
    }

    handleAccountData() {
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
  
        if (this.personalAccount && !this.editPersonal) {
            this.Editting = true;
            this.editInfo = false;
            this.NoteditInfo = true;
            this.editFirstNameValue = this.contactData?.firstName;
            this.editLastNameValue =  this.contactData?.lastName;
            this.editJobTitleValue = this.contactData?.jobTitle;
            this.editEMailAddressValue = this.accountData.eMailAddress;
            // this.editLanguageNameValue = this.contactData.languageName;
            this.editPhoneNumberValue = this.accountData.phone1Number;
     


        }else if(this.personalAccount && this.editPersonal){
            if (!this.editedPersonalData) {
                this.editedPersonalData = { ...this.accountData }; // ensure it's initialized
              }
              this.editedPersonalData.firstName= this.editFirstNameValue
              this.editedPersonalData.lastName= this.editLastNameValue
              this.editedPersonalData.eMailAddress = this.editEMailAddressValue;
              this.editedPersonalData.languageId = this.contactData.languageId;
              this.editedPersonalData.languageName = this.allLanguages.find(l => l.value == this.contactData.languageId)?.label;              
              this.editedPersonalData.phone1Number = this.editPhoneNumberValue;
              this.editedPersonalData.jobTitle = this.editJobTitleValue;
              this.editedPersonalData.emailAddressIsPublic = this.contactData?.emailAddressIsPublic;
              this.editedPersonalData.phone1IsPublic = this.contactData?.phone1IsPublic;
              this.contactData.languageName = this.editedPersonalData.languageName;
              this.editedContactData.emit(this.contactData)
              this.editedData.emit(this.editedPersonalData);
              this.editInfo = true;
              this.NoteditInfo = false;
              this.Editting = false;
              this.editPersonal = false;
           

        }

        else {
        
  
            this.editInfo = true;
            this.NoteditInfo = false;
            this.Editting = false;
            this.edit.emit();
        }
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
        this.showMainSpinner();
        this._AccountsServiceProxy.publishProfile(false)
            .pipe(
                finalize(() => this.hideMainSpinner()
                ))
            .subscribe((response) => {
                this.notify.info(this.l('Profile Published Successfully'));
                this.connectionCount == 0 ? this.showPrivate = false : this.showHide = false
                this.hidUshare = true;
                this.hideshowShare = true;
                this.showShare = true;
            }
            );
    }

    syncAccount() {
        this.showMainSpinner();
        this._AccountsServiceProxy.publishProfile(true).pipe(
            finalize(() => this.hideMainSpinner()
            )).subscribe(
                (response: boolean) => {
                    this.notify.success(this.l("Account sync Successfully"));
                    this.showIsSync = !response;
                    this.isSync = !response;
                    this.isSync = false;
                    
                });

    }

    UnShareAccount() {
        this.showMainSpinner();
        this._AccountsServiceProxy.unPublishProfile().pipe(
            finalize(() => this.hideMainSpinner()
            )).subscribe(
                (response) => {
                    this.notify.info(this.l('Profile UnPublished Successfully'));
                    this.showShare = false;
                    this.hidUshare = true;
                    this.hideshowShare = true;
                    this.showHide = true;
                    this.showPrivate = true;
                });
    }


    getContactSync() {
        this._AccountsServiceProxy.getContactSync(this.accountData.id)
            .subscribe((res: boolean) => {
                this.isSync = res;
            });

    }

    isNotManualLevel(): boolean {
     
        return this.accountLevel !== AccountLevelEnum.Manual;
    }


    isChangePersonalData(): boolean {
        if (!this.editFirstNameValue || !this.editLastNameValue || !this.editJobTitleValue || !this.editEMailAddressValue || !this.editLanguageNameValue || !this.editPhoneNumberValue)
            return false;


        if (this.editFirstNameValue == this.accountData.name &&  this.editJobTitleValue == this.accountData.jobTitle && this.editEMailAddressValue == this.accountData.eMailAddres && this.editLanguageNameValue == this.accountData.languageName && this.editPhoneNumberValue == this.accountData.phoneNumber)
            return false;

        return true;
    }

    get jobTitleAttr() {
        return this.accountData?.extraDataAttributes?.find(attr => attr.extraAttributeId === 706);
      }
      
    getLanguages() {
        this._appEntitiesServiceProxy.getAllLanguageForTableDropdown().subscribe(result => {
            this.allLanguages = result;
        });
    }


     
}
