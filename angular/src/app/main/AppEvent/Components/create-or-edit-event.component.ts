import {
    Component,
    OnInit,
    ViewChild,
    Injector,
    ElementRef,
    Output,
    EventEmitter,
    OnDestroy,
} from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import {
    AppAddressDto,
    AppEntitiesServiceProxy,
    AppEntityAddressDto,
    AppEntityAttachmentDto,
    AppEventsServiceProxy,
    AttachmentsCategories,
    CreateOrEditAppEventDto,
    SycAttachmentCategoryDto,
    TimeZoneInfoServiceProxy,
} from "@shared/service-proxies/service-proxies";
import * as moment from "moment";
import { MenuItem, SelectItem } from "primeng/api";

import { ModalDirective } from "ngx-bootstrap/modal";
import { NgForm } from "@angular/forms";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { CreateOrEditAddressModalComponent } from "@app/selectAddress/create-or-edit-Address-modal/create-or-edit-Address-modal.component";
import { SelectAddressModalComponent } from "@app/selectAddress/selectAddress/selectAddress-modal.component";
import { FileUploaderCustom } from "@shared/components/import-steps/models/FileUploaderCustom.model";
import Swal from "sweetalert2";
import { finalize } from "rxjs/operators";
import { Observable } from "rxjs";
import { ImageUploadComponentOutput } from "@app/shared/common/image-upload/image-upload.component";
/* import { GoogleMapComponent } from "@app/shared/common/GoogleMap/google-map/google-map.component";
 */
@Component({
    selector: "app-create-or-edit-event",
    templateUrl: "./create-or-edit-event.component.html",
    styleUrls: ["./create-or-edit-event.component.scss"],
    animations: [appModuleAnimation()],
})
export class CreateOrEditEventComponent
    extends AppComponentBase
    implements OnInit, OnDestroy
{
    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
    @ViewChild("eventForm", { static: true }) eventForm: NgForm;
    @ViewChild("step0Form", { static: true }) step0Form: NgForm;
    @ViewChild("step1Form", { static: true }) step1Form: NgForm;
    @ViewChild("step2Form", { static: true }) step2Form: NgForm;
    @ViewChild("createOrEditAddressModal", { static: true })
    createOrEditAddressModal: CreateOrEditAddressModalComponent;
    /* @ViewChild("googleMapModal", { static: true })
    googleMapModal: GoogleMapComponent; */
    @ViewChild("selectAddressModal", { static: true })
    selectAddressModal: SelectAddressModalComponent;
    @Output() createPostEvent = new EventEmitter<CreateOrEditAppEventDto>();
    @ViewChild("logoPhotoInput", { static: false }) logoPhotoInput: ElementRef;
    @ViewChild("coverPhotoInput", { static: false })
    coverPhotoInput: ElementRef;
    accountId: number;
    eventId: number;
    fromHomePage: boolean;
    items: MenuItem[];
    firstStep: number;
    lastStep: number;
    stepnum: number;
    ProfileImg: string | ArrayBuffer;
    coverPhoto: string | ArrayBuffer;
    event: CreateOrEditAppEventDto;
    attachmentsUploader: FileUploaderCustom;
    eventLinkWords: number;
    descriptionsWords: number;
    acceptEventLinkCharacters: number;
    acceptDescriptionsCharacters: number;
    minDate: Date;
    eventAddress: string = ""
    fromDate: Date;
    toDate: Date;
    fromTime: Date;
    fromHour: number;
    fromMinute: number;    
    toHour: number;
    toMinute: number;

    toTime: Date;
    allTimeZone: SelectItem[];
    publishEvent:boolean = true
    disablePublish:boolean
    createPostForEvent:boolean = true
    disableCreatePostForEvent:boolean
    logoFile : File
    coverFile : File
    sycAttachmentCategoryLogo:SycAttachmentCategoryDto
    sycAttachmentCategoryBanner:SycAttachmentCategoryDto

    constructor(
        private _timeZoneInfoServiceProxy: TimeZoneInfoServiceProxy,
        private _appEventsServiceProxy: AppEventsServiceProxy,
        private _entitiesService: AppEntitiesServiceProxy,
        injector: Injector
    ) {
        super(injector);
    }
    ngOnInit(): void {
        this.initData();
    }

    ngOnDestroy() {
        this.unsubscribeToAllSubscriptions();
    }

    initData() {
        const subs = this._timeZoneInfoServiceProxy
            .getTimeZonesList()
            .subscribe((result) => {
                this.allTimeZone = result;
            });
        this.subscriptions.push(subs);

        this.items = [
            { label: "Step 1" },
            { label: "Step 2" },
            { label: "Step 3" },
        ];
        this.firstStep = 0;
        this.lastStep = 2;
        this.stepnum = 0;
        this.initAttachments();
        this.acceptEventLinkCharacters = 1024;
        this.acceptDescriptionsCharacters = 5000;
        this.accountId = this.appSession?.user?.accountId;
    }

    initAttachments() {
        this.event = new CreateOrEditAppEventDto();
        this.event.attachments = [];
    }

    resetData() {
        if (this.logoPhotoInput) this.logoPhotoInput.nativeElement.value = "";
        if (this.coverPhotoInput) this.coverPhotoInput.nativeElement.value = "";
        this.stepnum = 0;
        this.ProfileImg = undefined;
        this.coverPhoto = undefined;
        this.initAttachments();
        this.step0Form.reset();
        this.step1Form.reset();
        this.step2Form.reset();
        this.eventForm.reset();
    }

    async show(_eventId: number, _fromHomePage: boolean) {
        this.eventId = _eventId;
        this.fromHomePage = _fromHomePage;
        if(this.fromHomePage){
            this.disablePublish = true
            this.disableCreatePostForEvent = true
            this.createPostForEvent = true
        } else {
            this.createPostForEvent = false
        }
        this.publishEvent = true
        this.event.id = this.eventId;
        this.minDate = new Date();
        this.attachmentsUploader = this.createCustomUploader();
        await this.getAttachmentCategories()
        //Create
        if (!this.event.id) {
            this.eventLinkWords = 0;
            this.event.id = 0
            this.descriptionsWords = 0;
            this.eventAddress = "";
            this.event.isOnLine = true;
            this.fromDate = new Date();
            this.toDate = new Date();
            this.fromTime = new Date();
            this.fromHour = new Date().getHours();        
            this.toHour = new Date().getHours();
            this.fromMinute = new Date().getMinutes();
            this.toMinute = new Date().getMinutes();
            this.toTime = new Date();
            this.event.fromDate = moment(new Date());
            this.event.toDate = moment(new Date());
            this.event.attachments = [];
            this.event.address = new AppEntityAddressDto()
        }
        //Edit
        else {
            this.getEventForEdit(this.eventId)
            .subscribe((res)=>{
                this.event = CreateOrEditAppEventDto.fromJS(res.appEvent.toJSON())
                this.eventLinkWords = this.event?.registrationLink?.length;
                this.descriptionsWords = this?.event?.description?.length;
                this.eventAddress = res?.appEvent?.address1
                    ? this.eventAddress != ""
                        ?  res?.appEvent?.address1
                        : res?.appEvent?.address1
                    : "";
                this.eventAddress += res?.appEvent?.address2
                    ? this.eventAddress != ""
                        ? " - " + res?.appEvent?.address2
                        : res?.appEvent?.address2
                    : "";
                this.eventAddress +=  res?.appEvent?.city
                    ? this.eventAddress != ""
                        ? " - " +  res?.appEvent?.city
                        :  res?.appEvent?.city
                    : "";
                this.eventAddress +=  res?.appEvent?.state
                    ? this.eventAddress != ""
                        ? " - " +  res?.appEvent?.state
                        :  res?.appEvent?.state
                    : "";
                this.eventAddress +=  res?.appEvent?.postal
                    ? this.eventAddress != ""
                        ? " - " + res?.appEvent?.postal
                        : res?.appEvent?.postal
                    : "";
                this.eventAddress += res?.appEvent?.country
                    ? this.eventAddress != ""
                        ? " - " + res?.appEvent?.country
                        : res?.appEvent?.country
                    : "";
                this.fromDate = this.event.fromDate.toDate()
                this.toDate = this.event.toDate.toDate()
                this.fromTime = this.event.fromTime.toDate()
                this.toTime = this.event.toTime.toDate()
                
                this.fromHour = this.fromTime.getHours();        
                this.toHour = this.toTime.getHours();
                this.fromMinute = this.fromTime.getMinutes();
                this.toMinute = this.toTime.getMinutes();

                this.minDate = this.fromDate
                this.ProfileImg = this.attachmentBaseUrl + '/' + res.appEvent.logoURL
                this.coverPhoto = this.attachmentBaseUrl + '/' + res.appEvent.banarURL
                if(!this.event.address) this.event.address = new AppEntityAddressDto();
            })
        }


        this.modal.show();
    }
    getEventForEdit(eventId:number){
        return this._appEventsServiceProxy.getAppEventForEdit(eventId)
    }
    hide() {
        this.resetData();
        this.modal.hide();
    }

    goNextStep() {
        this.stepnum += 1;
    }

    goPreviousStep() {
        this.stepnum -= 1;
    }
    imageBrowseDone($event:ImageUploadComponentOutput,index?:number){
        if ($event.file) {
            if (index == 0) {
                this.ProfileImg =  $event.image
                this.logoFile = $event.file
            } else if (index == 1) {
                this.coverFile = $event.file
                this.coverPhoto = $event.image
            }
        }
    }
    removeImage($event,index: number) {
        if (index == 0) {
            this.ProfileImg = undefined;
        }
        else if (index == 1) {
            this.coverPhoto = undefined;
        }
        let attExistedIndex = this.event.attachments.findIndex(x=>x.attachmentCategoryId == (index == 0 ? this.sycAttachmentCategoryLogo.id : this.sycAttachmentCategoryBanner.id) )
        this.event.attachments.splice(attExistedIndex,1)
    }
    onSubmit() {
        //create
        this.showMainSpinner();
        this.event.fromDate = moment(this.fromDate);
        this.event.toDate = moment(this.toDate);
        this.event.fromTime = moment(this.fromTime);
        this.event.toTime = moment(this.toTime);

        this.event.fromHour = this.fromTime.getHours();        
        this.event.toHour = this.toTime.getHours();
        this.event.fromMinute = this.fromTime.getMinutes();
        this.event.toMinute = this.toTime.getMinutes();


        this.event.privacy = false;
        this.onUploadAttachmets( this.event.id || (!this.event.id && !this.publishEvent) ? this.createEvent.bind(this) : this.isPublishedCreatePost.bind(this) );
    }

    onUploadAttachmets(successCallback:any) {

        if(this.logoFile)  this.attachmentsUploader.addToQueue([this.logoFile]);
        if(this.coverFile)  this.attachmentsUploader.addToQueue([this.coverFile]);
        this.attachmentsUploader.onBuildItemForm = (
            fileItem: any,
            form: any
        ) => {
            var logoAttachmentInfoDto: AppEntityAttachmentDto = new AppEntityAttachmentDto();
            var coverAttachmentInfoDto: AppEntityAttachmentDto = new AppEntityAttachmentDto();
            var logoGuid = this.guid();
            var coverGuid = this.guid();
            if(this.logoFile){
                let existedIndex = this.event.attachments.findIndex(x=>x.attachmentCategoryId == this.sycAttachmentCategoryLogo.id)
                if(existedIndex > -1) {
                    logoAttachmentInfoDto = this.event.attachments[existedIndex]
                } else logoAttachmentInfoDto.attachmentCategoryId = this.sycAttachmentCategoryLogo.id

                logoAttachmentInfoDto.guid = logoGuid;
                logoAttachmentInfoDto.fileName = this.logoFile.name;
                form.append("guid" + 0, logoGuid)
                logoAttachmentInfoDto.attachmentCategoryEnum = AttachmentsCategories.LOGO
                if(existedIndex > -1) {
                    this.event.attachments[existedIndex] = logoAttachmentInfoDto
                } else this.event.attachments.push(logoAttachmentInfoDto)

            }
            if(this.coverFile){
                let existedIndex = this.event.attachments.findIndex(x=>x.attachmentCategoryId == this.sycAttachmentCategoryBanner.id)
                if(existedIndex > -1) {
                    coverAttachmentInfoDto = this.event.attachments[existedIndex]
                } else coverAttachmentInfoDto.attachmentCategoryId = this.sycAttachmentCategoryBanner.id

                coverAttachmentInfoDto.guid = coverGuid;
                coverAttachmentInfoDto.fileName = this.coverFile.name;
                form.append("guid" + 1, coverGuid)
                coverAttachmentInfoDto.attachmentCategoryEnum = AttachmentsCategories.BANNER

                if(existedIndex > -1) {
                    this.event.attachments[existedIndex] = coverAttachmentInfoDto
                } else this.event.attachments.push(coverAttachmentInfoDto)
            }

        };

        this.attachmentsUploader.onErrorItem = (item, response, status) => {
            this.notify.error(this.l("UploadFailed"));
        };
        this.attachmentsUploader.onSuccessItem = successCallback
        this.attachmentsUploader.uploadAllFiles();
    }

    isPublishedCreatePost() {
        this.hideMainSpinner();
        let message :string ="TheEventWillBePublishedToTheMarketplace/EventsPageAndThePost"
        message += this.createPostForEvent ?  "WillBeAddedToTheHomepage/PostsPage" : "WillNotBeAddedToTheHomepage/PostsPage"
        Swal.fire({
            title: "",
            text: this.l(message),
            icon: "info",
            showCancelButton: true,
            cancelButtonText: this.l("No"),
            confirmButtonText: this.l("Yes"),
            allowOutsideClick: false,
            allowEscapeKey: false,
            backdrop: true,
            customClass: {
                icon: "swal-icon",
            },
        }).then((result) => {
            if (result.isConfirmed)
                //If 'Yes' => The system opens the create post page, "Create a Post", And displays Event Post details
                this.event.isPublished = true;
                //If 'No' => The system saves the event information, displays it on the "My Events" page with the status "Unpublished", unpublished it to the Marketplace/Events page, and does not create the event post on the Homepage/Posts page, closing the Event wizard.
            else this.event.isPublished = false;
            this.createEvent();
        });
    }

    createEvent() {
        if (! this.event.code) {
            if (this.appSession.tenantId)
                this.event.code = 'Event' + this.appSession.tenantId + moment(this.event.fromDate.toDate()).format("ddd,MMM-D,YYYY-HH:mm A");
            else
                this.event.code = 'Event' + moment(this.event.fromDate.toDate()).format("ddd,MMM-D,YYYY-HH:mm A");
        }
        delete this.event.status
        this.showMainSpinner();
        const subs = this._appEventsServiceProxy
            .createOrEdit(this.event)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe((result) => {
                if(!this.event.id){ //create
                    if (this.event.isPublished && this.createPostForEvent) {
                        this.event.entityId = result;
                        this.createPostEvent.emit(this.event);
                    } else {
                        this.notify.success(this.l("CreatedSuccessfully"))
                    }
                } else {
                    this.notify.success(this.l("UpdateHasBeenSaved"))
                }
                this.hide();
            });
        this.subscriptions.push(subs);
    }
    onChangeEventLink() {
        this.eventLinkWords = this.event.registrationLink
            ? this.event.registrationLink.length
            : 0;
    }
    onChangeDescriptions() {
        this.descriptionsWords = this.event.description
            ? this.event.description.length
            : 0;
    }
    onactiveIndexChange($event: number) {
        if ($event == 0 || !this.disabledNextBtn($event - 1)) {
            this.stepnum = $event;
            return;
        }
    }

    disabledNextBtn(stepNum: number): boolean {
        switch (stepNum) {
            case 0:
                if (this.step0Form.valid)
                    return !this.ProfileImg || !this.coverPhoto;
                else return this.step0Form.invalid;
                //return this.step0Form.invalid && this.ProfileImg=='' && this.coverPhoto=='';
                break;

            case 1:
                return this.step1Form.invalid;
                break;

            case 2:
                return this.step2Form.invalid;
                break;
        }
    }

    selectAddress() {
        this.selectAddressModal.show(undefined, this.accountId);
    }
    addressSelected(address: AppAddressDto) {
        this.eventAddress = "";
        if(this.event?.address?.id){
            this.event.address = new AppEntityAddressDto();
        }
        this.event.address.addressId = address.id;

        const subs = this._entitiesService
            .getAllAddressTypeForTableDropdown()
            .subscribe((result) => {
                var index = result.findIndex(
                    (x) => x.label.toUpperCase() == "LOCATION"
                );
                if (index > 0) this.event.address.addressTypeId = result[index].value;
            });
        this.subscriptions.push(subs);

        this.eventAddress += address?.name ? address?.name : "";
        this.eventAddress += address?.addressLine1
            ? this.eventAddress != ""
                ? " - " + address?.addressLine1
                : address?.addressLine1
            : "";
        this.eventAddress += address?.addressLine2
            ? this.eventAddress != ""
                ? " - " + address?.addressLine2
                : address?.addressLine2
            : "";
        this.eventAddress += address?.city
            ? this.eventAddress != ""
                ? " - " + address?.city
                : address?.city
            : "";
        this.eventAddress += address?.state
            ? this.eventAddress != ""
                ? " - " + address?.state
                : address?.state
            : "";
        this.eventAddress += address?.postalCode
            ? this.eventAddress != ""
                ? " - " + address?.postalCode
                : address?.postalCode
            : "";
        this.eventAddress += address?.countryIdName
            ? this.eventAddress != ""
                ? " - " + address?.countryIdName
                : address?.countryIdName
            : "";
        this.selectAddressModal.close();
    }

    addNewAddress() {
        this.selectAddressModal.close();
        this.createOrEditAddressModal.show(
            undefined,
            undefined,
            this.accountId
        );
    }
    editAddress(addressId: number) {
        this.selectAddressModal.close();
        this.createOrEditAddressModal.show(addressId);
    }

    addressSelectionCanceled() {
        this.selectAddressModal.close();
    }
    addressAdded(address: AppAddressDto) {
        this.createOrEditAddressModal.close();
        this.selectAddressModal.addressAdded(address);
    }
    addressUpdated(address: AppAddressDto) {
        this.createOrEditAddressModal.close();
        this.selectAddressModal.addressUpdated(address);
    }
    createOrEditaddressCanceled() {
        this.selectAddressModal.show(undefined, this.accountId);
    }
    /* showAddressOnMap() {
        this.googleMapModal.show(this.eventAddress);
    } */

    async getAttachmentCategories(){
        await this.getSycAttachmentCategoriesByCodes(['LOGO',"BANNER"]).subscribe((result)=>{
            this.sycAttachmentCategoryLogo = result[0]
            this.sycAttachmentCategoryBanner = result[1]
        })
    }
}
