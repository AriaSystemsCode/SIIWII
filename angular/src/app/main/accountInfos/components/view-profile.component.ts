import { Component, ViewChild, Injector, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { AccountDto, AccountLevelEnum, AppEntitiesServiceProxy, SycAttachmentCategoryDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { NgImageSliderComponent } from 'ng-image-slider';
import { AppConsts } from '@shared/AppConsts';
import { SelectItem } from 'primeng';
import { ImageObject } from '../../accounts/account-shared/models/imageobject';
import { appModuleAnimation } from '@shared/animations/routerTransition';

@Component({
    selector: 'app-view-profile',
    styleUrls: ['./view-profile.component.scss'],
    templateUrl: './view-profile.component.html',
    animations: [appModuleAnimation()]
})
export class ViewProfileComponent extends AppComponentBase implements OnChanges,OnInit {
   
    @ViewChild('nav') slider: NgImageSliderComponent;
    @Input('accountData') accountData: AccountDto;
    @Input('isPublished') isPublished: boolean;
    @Input() viewMode: boolean;
    @Input() accountLevel: AccountLevelEnum;

    @Output("edit") edit: EventEmitter<boolean> = new EventEmitter<boolean>()
    @Output("delete") delete: EventEmitter<boolean> = new EventEmitter<boolean>()
    @Output("publish") publish: EventEmitter<boolean> = new EventEmitter<boolean>()
    @Output("unPublish") unPublish: EventEmitter<boolean> = new EventEmitter<boolean>()

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
    sycAttachmentCategoryLogo :SycAttachmentCategoryDto
    sycAttachmentCategoryBanner :SycAttachmentCategoryDto
    sycAttachmentCategoryImage :SycAttachmentCategoryDto
    
    constructor(
        injector: Injector,
        private _appEntitiesServiceProxy: AppEntitiesServiceProxy
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
    ngOnInit(){
        this.getAllForAccountInfo()
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
        else this.accountData.categories =  this.initDepartment;

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
            this.initClassification =   this.accountData.classfications
        else  this.accountData.classfications =  this.initClassification;

        this.noOfClassificationToShowInitially = 10;
        this.maxClassificationCount = 10;
        this.scrollClassification = false;
        this.maxClassificationCnt = 40;
        this.classificationToLoad = 20;
        this.totalClassification =  this.accountData.classificationsTotalCount;
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
        this.getSycAttachmentCategoriesByCodes(['LOGO',"BANNER","IMAGE"]).subscribe((result)=>{
            result.forEach(item=>{
                if(item.code == "LOGO") this.sycAttachmentCategoryLogo = item
                else if(item.code == "BANNER") this.sycAttachmentCategoryBanner = item
                else if(item.code == "IMAGE") this.sycAttachmentCategoryImage = item
            })
        })

    }
    publishProfile(){
        this.publish.emit(true);
    }

    unPublishProfile(){
        this.unPublish.emit(true);
    }


}
