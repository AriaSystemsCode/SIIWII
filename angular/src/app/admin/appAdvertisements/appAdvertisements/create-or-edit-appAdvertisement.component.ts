import { Component, Injector, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { AppAdvertisementsServiceProxy, AppEntityAttachmentDto, CreateOrEditAppAdvertisementDto, GetSycAttachmentCategoryForViewDto, OccuranceUnitOfTime, SycAttachmentCategoriesServiceProxy, SycAttachmentCategoryDto, TenantServiceProxy, TimeZoneInfoServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { ImageUploadComponentOutput } from '@app/shared/common/image-upload/image-upload.component';
import { SelectItem } from 'primeng/api';

@Component({
    templateUrl: './create-or-edit-appAdvertisement.component.html',
    styleUrls: ['./create-or-edit-appAdvertisement.component.scss'],
    animations: [appModuleAnimation()],
    providers:[TimeZoneInfoServiceProxy]
})
export class CreateOrEditAppAdvertisementComponent extends AppComponentBase implements OnInit {
    active = false;
    saving = false;
    appAdvertisement: CreateOrEditAppAdvertisementDto = new CreateOrEditAppAdvertisementDto();
    attachmentCategoriesLogo: GetSycAttachmentCategoryForViewDto
    appEntityName = '';
    userName = '';
    allTimeZone: SelectItem[];
    tenants: SelectItem[] = []
    isLinear = true;
    isEditable = true;
    homeImage:string
    marketPlaceImage:string
    sycAttachmentCategoryPhoto:SycAttachmentCategoryDto
    sycAttachmentCategoryBanner:SycAttachmentCategoryDto
    occuranceUnitOfTime: SelectItem[] = []
    constructor(
        injector: Injector,
        private _activatedRoute: ActivatedRoute,
        private _appAdvertisementsServiceProxy: AppAdvertisementsServiceProxy,
        private _router: Router,
        private _tenantService: TenantServiceProxy,
        private _SycAttachmentCategoriesServiceProxy: SycAttachmentCategoriesServiceProxy,
        private _timeZoneInfoServiceProxy : TimeZoneInfoServiceProxy,
    ) {
        super(injector);

    }

    ngOnInit(): void {
        this.show(this._activatedRoute.snapshot.queryParams['id']);
    }
    async getAllAttachmentsCategories(){
        return this.getSycAttachmentCategoriesByCodes(['PHOTO',"BANNER"]).toPromise()
    }
    async show(appAdvertisementId?: number) {
        this.loadTenants()
        this.loadTimeZones()
        await this.getAllAttachmentsCategories().then((result)=>{
            result.forEach(item=>{
                if(item.code == "PHOTO") this.sycAttachmentCategoryPhoto = item
                if(item.code == "BANNER") this.sycAttachmentCategoryBanner = item
            })
        })
        this.loadOccuranceUnitOfTimes()
        if (!this.uploader) this.initUploaders()
        if (!appAdvertisementId) {
            this.appAdvertisement = new CreateOrEditAppAdvertisementDto();
            this.appAdvertisement.id = appAdvertisementId;
            this.appAdvertisement.startDate = moment().startOf('day');
            this.appAdvertisement.endDate = moment().startOf('day');
            this.appAdvertisement.occuranceUnitOfTime = OccuranceUnitOfTime.Hour;
            // this.appAdvertisement.approvalDateTime = moment().startOf('day');
            // this.appAdvertisement.utcFromDateTime = moment().startOf('day');
            // this.appAdvertisement.utcToDateTime = moment().startOf('day');
            this.appEntityName = '';
            this.userName = '';
            this.appAdvertisement.attachments = []

            this.active = true;
        } else {
            this._appAdvertisementsServiceProxy.getAppAdvertisementForEdit(appAdvertisementId).subscribe(result => {
                this.appAdvertisement = result.appAdvertisement;
                this.appEntityName = result.appEntityName;
                this.userName = result.userName;
                if (!this.appAdvertisement?.attachments) this.appAdvertisement.attachments = []
                else {
                    this.appAdvertisement.attachments.forEach(element => {
                        if(element.attachmentCategoryId == this.sycAttachmentCategoryPhoto.id) this.homeImage = `${this.attachmentBaseUrl}/${element.url}`;
                        else if(element.attachmentCategoryId == this.sycAttachmentCategoryBanner.id) this.marketPlaceImage = `${this.attachmentBaseUrl}/${element.url}`;
                    });
                }
                this.active = true;
            });
        }
    }

    save(): void {
        this.saving = true;
        this.appAdvertisement.code = this.appAdvertisement.tenantId + '-' +  Date.now().toString();
        this._appAdvertisementsServiceProxy.createOrEdit(this.appAdvertisement)
            .pipe(finalize(() => {
                this.saving = false;
            }))
            .subscribe(x => {
                this.saving = false;
                this.notify.info(this.l('SavedSuccessfully'));
                this._router.navigate(['/app/admin/appAdvertisements/appAdvertisements']);
            })
    }


    setAppEntityIdNull() {
        this.appAdvertisement.appEntityId = null;
        this.appEntityName = '';
    }
    setUserIdNull() {
        this.appAdvertisement.userId = null;
        this.userName = '';
    }
    loadTenants() {
        this._tenantService.getTenants(
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            "Name",
            undefined,
            undefined
        ).subscribe((res) => {
            this.tenants = [{ label: "None", value: null }]
            res.items.forEach(item => {
                this.tenants.push({
                    label: item.name,
                    value: item.id
                })
            })
        })
    }
    loadTimeZones() {
        this._timeZoneInfoServiceProxy.getTimeZonesList()
            .subscribe(res => {
                this.allTimeZone = [{ label: "None", value: null }, ...res];
            })
    }
    loadOccuranceUnitOfTimes() {
        this.occuranceUnitOfTime = [
            { label: "None", value: null },
            { value: OccuranceUnitOfTime.Hour, label: OccuranceUnitOfTime[OccuranceUnitOfTime.Hour] },
            { value: OccuranceUnitOfTime.Day, label: OccuranceUnitOfTime[OccuranceUnitOfTime.Day] },
            { value: OccuranceUnitOfTime.Week, label: OccuranceUnitOfTime[OccuranceUnitOfTime.Week] },
            { value: OccuranceUnitOfTime.Month, label: OccuranceUnitOfTime[OccuranceUnitOfTime.Month] },
        ]
    }

    imageBrowseDone($event:ImageUploadComponentOutput,sycAttachmentCategory:SycAttachmentCategoryDto){
        let exidtedIndex:number=-1;
        let att: AppEntityAttachmentDto
        let guid = this.guid();


        exidtedIndex = this.appAdvertisement.attachments.findIndex(x => x.attachmentCategoryId == sycAttachmentCategory.id);

        if (exidtedIndex > -1) {
            att = this.appAdvertisement.attachments[exidtedIndex]
        } else {
            att = new AppEntityAttachmentDto();
        }
        att.fileName = $event.file.name;
        att.attachmentCategoryId = sycAttachmentCategory.id;
        att.guid = guid;

        if (this.sycAttachmentCategoryPhoto.id == att.attachmentCategoryId) {
            this.homeImage = $event.image
        }
        else if (this.sycAttachmentCategoryBanner.id == att.attachmentCategoryId) {
            this.marketPlaceImage = $event.image
        }

        if (exidtedIndex == -1) {
            this.appAdvertisement.attachments.push(att);
        }

        this.uploader.addToQueue([$event.file]);

        this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
            form.append('guid', guid);
        };

        this.uploader.uploadAll()

        if (this.appAdvertisement.attachments == null || this.appAdvertisement.attachments == undefined) {
            this.appAdvertisement.attachments = [];
        }
    }


    removeImage($event, att:SycAttachmentCategoryDto) {
        if (att.id == this.sycAttachmentCategoryPhoto.id) {
            this.homeImage = undefined;
        }
        else if (att.id == this.sycAttachmentCategoryBanner.id) {
            this.marketPlaceImage = undefined;
        }
        let attExistedIndex = this.appAdvertisement.attachments.findIndex(x=>x.attachmentCategoryId == att.id )
        this.appAdvertisement.attachments.splice(attExistedIndex,1)
    }
    setApprovalDateTime($event:boolean){
        if($event) this.appAdvertisement.approvalDateTime = moment().startOf('day');
        else this.appAdvertisement.approvalDateTime = undefined;
    }
}
