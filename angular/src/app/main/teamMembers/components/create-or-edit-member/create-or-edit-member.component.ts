import { BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { AccountsServiceProxy, AppEntitiesServiceProxy, SycAttachmentCategoriesServiceProxy, AppEntityAttachmentDto, TreeNodeOfBranchForViewDto, ContactDto, LookupLabelDto, BranchForViewDto, SycIdentifierDefinitionsServiceProxy, SycAttachmentCategoryDto, SycEntityObjectTypesServiceProxy, GetAllEntityObjectTypeOutput, AppEntityExtraDataDto, GetAppTransactionsForViewDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ViewChild, Component, EventEmitter, Injector, Output } from '@angular/core';
import { SelectBranchModalComponent } from '../../../../select-branch/select-branch-modal/select-branch-modal.component';
import { NgForm } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { ImageUploadComponentOutput } from '@app/shared/common/image-upload/image-upload.component';
import { UpdateLogoService } from '@shared/utils/update-logo.service';
import * as moment from 'moment';
import { ExtraAttributeDataService } from '@app/main/app-items/app-item-shared/services/extra-attribute-data.service';
import { CreateEditAppItemExtraAttribute } from '@app/main/app-items/app-item-shared/models/create-edit-app-item-extra-attribute';
import { EExtraAttributeUsage } from '@app/main/app-items/appItems/models/extra-attribute-usage.enum';
import { FilteredExtraAttribute } from '@app/main/app-items/app-item-shared/models/filtered-extra-attribute';
import { SelectItem } from '@node_modules/primeng/api';

@Component({
    selector: 'app-create-or-edit-member',
    templateUrl: './create-or-edit-member.component.html',
    styleUrls: ['./create-or-edit-member.component.scss'],
    animations: [appModuleAnimation()]
})
export class CreateOrEditMemberComponent extends AppComponentBase {
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('selectBranchModal', { static: true }) selectBranchModal: SelectBranchModalComponent;
    @ViewChild('memberForm', { static: true }) memberForm: NgForm
    @Output() createOrEditDone = new EventEmitter<{ memberId: number, userId: number }>();
    memberDto: ContactDto;

    branches: TreeNodeOfBranchForViewDto[];


    logoId: number;
    bannerId: number;
    ProfileImg: any;
    coverPhoto: any;
    canCreate: boolean = false
    canEdit: boolean = false

    allPhoneTypes: LookupLabelDto[];
    allLanguages: LookupLabelDto[];
    phonelist: Object[] = [];
    active = false;
    phonesLoaded: boolean = false
    entityObjectType: string = "MANUALACCOUNTCONTACT";
    joinDate = new Date();


    isManualOrExternalContact: boolean = true
    sycAttachmentCategoryLogo: SycAttachmentCategoryDto
    sycAttachmentCategoryBanner: SycAttachmentCategoryDto

    selectedBranchId: number
    selectedBranchName: string
    


    data:any
    allAttributes = []; // flat list from API
    groupedByUsage = {}; // { RECOMMENDED: [], ADDITIONAL: [] }
    usageList: string[] = []; // for sidebar
    selectedUsage: string;


      selectedTransactionTypeData: GetAllEntityObjectTypeOutput =
        new GetAllEntityObjectTypeOutput();
        selectedTransTypeData:any
      extraAttributes: any;

      activeAccordionIndexes: number[] = [0]; // open first tab by default
      appTransactionsForViewDto:any
      hasUnsavedChanges = false;

    constructor(injector: Injector,
        private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,
        private _SycAttachmentCategoriesServiceProxy: SycAttachmentCategoriesServiceProxy,
        private _AccountsServiceProxy: AccountsServiceProxy,
        private _sycIdentifierDefinitionsServiceProxy: SycIdentifierDefinitionsServiceProxy,
        private updateLogoService: UpdateLogoService,
        private _sycEntityObjectTypesServiceProxy: SycEntityObjectTypesServiceProxy,
        private _extraAttributeDataService: ExtraAttributeDataService,
    ) {
        super(injector);
        this.appTransactionsForViewDto= {
            "lastRecord": false,
            "firstRecord": false,
            "creatorUserId": 30671,
            "orderConfirmationFile": "JVBERi0xLjQNCiWio4Whq54rz3Wf66ibiVua20G3Z+6W7mL3o+DQoNCnN0YXJ0eHJlZg0KNjg4NDgNCiUlRU9GDQo=",
            "sharedWithUsers": null,
            "isOwnedByMe": true,
            "creatorTenantName": null,
            "isOrderInformationValid": false,
            "isBuyerContactInformationValid": true,
            "isSellerContactInformationValid": true,
            "isSalesRepInformationValid": true,
            "isShippingInformationValid": false,
            "isBillingInformationValid": false,
            "entityCategoriesNames": {
                "totalCount": 0,
                "items": []
            },
            "entityClassificationsNames": {
                "totalCount": 0,
                "items": []
            },
            "showSync": false,
            "lastModifiedDate": "2025-05-11T06:55:33",
            "shipViaName": "DHL Express",
            "paymentTermsName": null,
            "creationDate": "2025-05-11T06:55:33.2538026",
            "extraDataAttributes": [
                {
                    "extraAttrUsage": "Order Approval",
                    "extraAttrName": "Approved",
                    "selectedValuesTotalCount": 0,
                    "extraAttrDataType": "boolean",
                    "extraAttributeId": 1111,
                    "selectedValues": [
                        {
                            "code": null,
                            "value": "true",
                            "totalCount": 0,
                            "entityAttachments": null,
                            "defaultEntityAttachment": null,
                            "edRestAttributes": null,
                            "colorImage": null,
                            "colorHexaCode": null
                        }
                    ]
                },
                {
                    "extraAttrUsage": "Order Approval",
                    "extraAttrName": "ApprovalNumber",
                    "selectedValuesTotalCount": 0,
                    "extraAttrDataType": "string",
                    "extraAttributeId": 1112,
                    "selectedValues": [
                        {
                            "code": null,
                            "value": "",
                            "totalCount": 0,
                            "entityAttachments": null,
                            "defaultEntityAttachment": null,
                            "edRestAttributes": null,
                            "colorImage": null,
                            "colorHexaCode": null
                        }
                    ]
                },
                {
                    "extraAttrUsage": "Order Approval",
                    "extraAttrName": "Approved Amount",
                    "selectedValuesTotalCount": 0,
                    "extraAttrDataType": "Numeric",
                    "extraAttributeId": 1113,
                    "selectedValues": [
                        {
                            "code": null,
                            "value": "",
                            "totalCount": 0,
                            "entityAttachments": null,
                            "defaultEntityAttachment": null,
                            "edRestAttributes": null,
                            "colorImage": null,
                            "colorHexaCode": null
                        }
                    ]
                },
                {
                    "extraAttrUsage": "Order Approval",
                    "extraAttrName": "Approved Date",
                    "selectedValuesTotalCount": 0,
                    "extraAttrDataType": "Datetime",
                    "extraAttributeId": 1114,
                    "selectedValues": [
                        {
                            "code": null,
                            "value": "2025-05-14T07:00:00.000Z",
                            "totalCount": 0,
                            "entityAttachments": null,
                            "defaultEntityAttachment": null,
                            "edRestAttributes": null,
                            "colorImage": null,
                            "colorHexaCode": null
                        }
                    ]
                },
                {
                    "extraAttrUsage": "Order Approval",
                    "extraAttrName": "Approval Reason",
                    "selectedValuesTotalCount": 0,
                    "extraAttrDataType": "string",
                    "extraAttributeId": 1115,
                    "selectedValues": [
                        {
                            "code": null,
                            "value": "Correct Date",
                            "totalCount": 0,
                            "entityAttachments": null,
                            "defaultEntityAttachment": null,
                            "edRestAttributes": null,
                            "colorImage": null,
                            "colorHexaCode": null
                        },
                        {
                            "code": null,
                            "value": "Correct Date",
                            "totalCount": 0,
                            "entityAttachments": null,
                            "defaultEntityAttachment": null,
                            "edRestAttributes": null,
                            "colorImage": null,
                            "colorHexaCode": null
                        },
                        {
                            "code": null,
                            "value": "Correct Date",
                            "totalCount": 0,
                            "entityAttachments": null,
                            "defaultEntityAttachment": null,
                            "edRestAttributes": null,
                            "colorImage": null,
                            "colorHexaCode": null
                        }
                    ]
                }
            ],
            "enteredByUserRole": null,
            "buyerCompanySSIN": "Business-000000000014-2DVF-M1",
            "buyerCompanyName": "Ross Stores, Inc.",
            "sellerId": null,
            "sellerCompanyName": "DVF 2",
            "buyerContactEMailAddress": "Emmy@ross.com",
            "languageId": 43,
            "languageCode": "eng",
            "currencyId": 438,
            "currencyCode": "USD",
            "sellerContactEMailAddress": "mohamed.abdelmonem1985@gmail.com",
            "buyerContactPhoneNumber": "1239874563",
            "sellerContactPhoneNumber": "2024569645",
            "buyerContactName": "Emmy  Watson",
            "sellerContactName": "admin DVF 2",
            "priceLevel": "A",
            "buyerContactSSIN": null,
            "buyerBranchSSIN": null,
            "buyerBranchName": null,
            "sellerBranchSSIN": null,
            "sellerBranchName": null,
            "sellerContactSSIN": null,
            "transactionType": 0,
            "entityStatusCode": "OPEN",
            "completeDate": "2023-12-21T00:00:00",
            "sellerCompanySSIN": "Business-000000000014",
            "startDate": "2023-11-21T00:00:00",
            "availableDate": "2023-12-21T00:00:00",
            "shipViaId": 395259,
            "shipViaCode": "DHL Express",
            "paymentTermsId": null,
            "paymentTermsCode": null,
            "buyerDepartment": "Women",
            "appTransactionsDetails": [],
            "appTransactionContacts": [
        
            ],
            "buyerStore": null,
            "totalQuantity": 800,
            "totalAmount": 80000,
            "lFromPlaceOrder": false,
            "currencyExchangeRate": 1,
            "reference": null,
            "enteredDate": "0001-01-01T00:00:00",
            "createManualAccount": false,
            "createManualContact": false,
            "tenantId": 2452,
            "attachmentSourceTenantId": null,
            "name": "Sales Order#6",
            "code": "6",
            "notes": null,
            "isHostRecord": false,
            "addFromAttachments": false,
            "relatedEntityId": null,
            "entityObjectTypeId": 723,
            "entityObjectTypeCode": "SALESORDER",
            "entityObjectStatusId": 27,
            "objectId": 45,
            "entityAddresses": [],
            "entityCategories": [],
            "entityClassifications": [],
            "entityAttachments": [
        
            ],
            "entityExtraData": [
                {
                    "entityId": 371022,
                    "entityObjectTypeId": null,
                    "entityObjectTypeCode": null,
                    "entityObjectTypeName": null,
                    "attributeValueId": null,
                    "attributeValue": "",
                    "attributeId": 660,
                    "attributeValueFkName": null,
                    "attributeValueFkCode": null,
                    "attributeCode": null,
                    "id": 1021852
                },
                {
                    "entityId": 371022,
                    "entityObjectTypeId": null,
                    "entityObjectTypeCode": null,
                    "entityObjectTypeName": null,
                    "attributeValueId": null,
                    "attributeValue": "",
                    "attributeId": 661,
                    "attributeValueFkName": null,
                    "attributeValueFkCode": null,
                    "attributeCode": null,
                    "id": 1021853
                },
                {
                    "entityId": 371022,
                    "entityObjectTypeId": null,
                    "entityObjectTypeCode": null,
                    "entityObjectTypeName": null,
                    "attributeValueId": null,
                    "attributeValue": "",
                    "attributeId": 662,
                    "attributeValueFkName": null,
                    "attributeValueFkCode": null,
                    "attributeCode": null,
                    "id": 1021854
                },
                {
                    "entityId": 371022,
                    "entityObjectTypeId": null,
                    "entityObjectTypeCode": null,
                    "entityObjectTypeName": null,
                    "attributeValueId": null,
                    "attributeValue": "2025-04-23T07:00:00.000Z",
                    "attributeId": 660,
                    "attributeValueFkName": null,
                    "attributeValueFkCode": null,
                    "attributeCode": null,
                    "id": 1021855
                },
                {
                    "entityId": 371022,
                    "entityObjectTypeId": null,
                    "entityObjectTypeCode": null,
                    "entityObjectTypeName": null,
                    "attributeValueId": null,
                    "attributeValue": "2025-04-24T07:00:00.000Z",
                    "attributeId": 661,
                    "attributeValueFkName": null,
                    "attributeValueFkCode": null,
                    "attributeCode": null,
                    "id": 1021856
                },
                {
                    "entityId": 371022,
                    "entityObjectTypeId": null,
                    "entityObjectTypeCode": null,
                    "entityObjectTypeName": null,
                    "attributeValueId": null,
                    "attributeValue": "",
                    "attributeId": 662,
                    "attributeValueFkName": null,
                    "attributeValueFkCode": null,
                    "attributeCode": null,
                    "id": 1021857
                },
                {
                    "entityId": 371022,
                    "entityObjectTypeId": null,
                    "entityObjectTypeCode": null,
                    "entityObjectTypeName": null,
                    "attributeValueId": null,
                    "attributeValue": "",
                    "attributeId": 660,
                    "attributeValueFkName": null,
                    "attributeValueFkCode": null,
                    "attributeCode": null,
                    "id": 1021868
                },
                {
                    "entityId": 371022,
                    "entityObjectTypeId": null,
                    "entityObjectTypeCode": null,
                    "entityObjectTypeName": null,
                    "attributeValueId": null,
                    "attributeValue": "",
                    "attributeId": 661,
                    "attributeValueFkName": null,
                    "attributeValueFkCode": null,
                    "attributeCode": null,
                    "id": 1021869
                },
                {
                    "entityId": 371022,
                    "entityObjectTypeId": null,
                    "entityObjectTypeCode": null,
                    "entityObjectTypeName": null,
                    "attributeValueId": null,
                    "attributeValue": "",
                    "attributeId": 662,
                    "attributeValueFkName": null,
                    "attributeValueFkCode": null,
                    "attributeCode": null,
                    "id": 1021870
                },
                {
                    "entityId": 371022,
                    "entityObjectTypeId": null,
                    "entityObjectTypeCode": null,
                    "entityObjectTypeName": null,
                    "attributeValueId": null,
                    "attributeValue": null,
                    "attributeId": 660,
                    "attributeValueFkName": null,
                    "attributeValueFkCode": null,
                    "attributeCode": null,
                    "id": 1021905
                },
                {
                    "entityId": 371022,
                    "entityObjectTypeId": null,
                    "entityObjectTypeCode": null,
                    "entityObjectTypeName": null,
                    "attributeValueId": null,
                    "attributeValue": null,
                    "attributeId": 661,
                    "attributeValueFkName": null,
                    "attributeValueFkCode": null,
                    "attributeCode": null,
                    "id": 1021906
                },
                {
                    "entityId": 371022,
                    "entityObjectTypeId": null,
                    "entityObjectTypeCode": null,
                    "entityObjectTypeName": null,
                    "attributeValueId": null,
                    "attributeValue": "",
                    "attributeId": 662,
                    "attributeValueFkName": null,
                    "attributeValueFkCode": null,
                    "attributeCode": null,
                    "id": 1021907
                },
                {
                    "entityId": 371022,
                    "entityObjectTypeId": null,
                    "entityObjectTypeCode": null,
                    "entityObjectTypeName": null,
                    "attributeValueId": null,
                    "attributeValue": null,
                    "attributeId": 108,
                    "attributeValueFkName": null,
                    "attributeValueFkCode": null,
                    "attributeCode": null,
                    "id": 1021908
                },
                {
                    "entityId": 371022,
                    "entityObjectTypeId": null,
                    "entityObjectTypeCode": null,
                    "entityObjectTypeName": null,
                    "attributeValueId": null,
                    "attributeValue": null,
                    "attributeId": 201,
                    "attributeValueFkName": null,
                    "attributeValueFkCode": null,
                    "attributeCode": null,
                    "id": 1021909
                },
                {
                    "entityId": 371022,
                    "entityObjectTypeId": null,
                    "entityObjectTypeCode": null,
                    "entityObjectTypeName": null,
                    "attributeValueId": null,
                    "attributeValue": null,
                    "attributeId": 202,
                    "attributeValueFkName": null,
                    "attributeValueFkCode": null,
                    "attributeCode": null,
                    "id": 1021910
                },
                {
                    "entityId": 371022,
                    "entityObjectTypeId": null,
                    "entityObjectTypeCode": null,
                    "entityObjectTypeName": null,
                    "attributeValueId": null,
                    "attributeValue": null,
                    "attributeId": 203,
                    "attributeValueFkName": null,
                    "attributeValueFkCode": null,
                    "attributeCode": null,
                    "id": 1021911
                },
                {
                    "entityId": 371022,
                    "entityObjectTypeId": null,
                    "entityObjectTypeCode": null,
                    "entityObjectTypeName": null,
                    "attributeValueId": null,
                    "attributeValue": null,
                    "attributeId": 204,
                    "attributeValueFkName": null,
                    "attributeValueFkCode": null,
                    "attributeCode": null,
                    "id": 1021912
                },
                {
                    "entityId": 371022,
                    "entityObjectTypeId": null,
                    "entityObjectTypeCode": null,
                    "entityObjectTypeName": null,
                    "attributeValueId": null,
                    "attributeValue": null,
                    "attributeId": 205,
                    "attributeValueFkName": null,
                    "attributeValueFkCode": null,
                    "attributeCode": null,
                    "id": 1021913
                },
                {
                    "entityId": 371022,
                    "entityObjectTypeId": null,
                    "entityObjectTypeCode": null,
                    "entityObjectTypeName": null,
                    "attributeValueId": null,
                    "attributeValue": null,
                    "attributeId": 206,
                    "attributeValueFkName": null,
                    "attributeValueFkCode": null,
                    "attributeCode": null,
                    "id": 1021914
                },
                {
                    "entityId": 371022,
                    "entityObjectTypeId": null,
                    "entityObjectTypeCode": null,
                    "entityObjectTypeName": null,
                    "attributeValueId": 459568,
                    "attributeValue": null,
                    "attributeId": 1115,
                    "attributeValueFkName": null,
                    "attributeValueFkCode": null,
                    "attributeCode": null,
                    "id": 1022564
                },
                {
                    "entityId": 371022,
                    "entityObjectTypeId": null,
                    "entityObjectTypeCode": null,
                    "entityObjectTypeName": null,
                    "attributeValueId": 459568,
                    "attributeValue": null,
                    "attributeId": 1115,
                    "attributeValueFkName": null,
                    "attributeValueFkCode": null,
                    "attributeCode": null,
                    "id": 1022573
                },
                {
                    "entityId": 371022,
                    "entityObjectTypeId": null,
                    "entityObjectTypeCode": null,
                    "entityObjectTypeName": null,
                    "attributeValueId": null,
                    "attributeValue": "true",
                    "attributeId": 1111,
                    "attributeValueFkName": null,
                    "attributeValueFkCode": null,
                    "attributeCode": null,
                    "id": 1023514
                },
                {
                    "entityId": 371022,
                    "entityObjectTypeId": null,
                    "entityObjectTypeCode": null,
                    "entityObjectTypeName": null,
                    "attributeValueId": null,
                    "attributeValue": "",
                    "attributeId": 1112,
                    "attributeValueFkName": null,
                    "attributeValueFkCode": null,
                    "attributeCode": null,
                    "id": 1023515
                },
                {
                    "entityId": 371022,
                    "entityObjectTypeId": null,
                    "entityObjectTypeCode": null,
                    "entityObjectTypeName": null,
                    "attributeValueId": null,
                    "attributeValue": "",
                    "attributeId": 1113,
                    "attributeValueFkName": null,
                    "attributeValueFkCode": null,
                    "attributeCode": null,
                    "id": 1023516
                },
                {
                    "entityId": 371022,
                    "entityObjectTypeId": null,
                    "entityObjectTypeCode": null,
                    "entityObjectTypeName": null,
                    "attributeValueId": null,
                    "attributeValue": "2025-05-14T07:00:00.000Z",
                    "attributeId": 1114,
                    "attributeValueFkName": null,
                    "attributeValueFkCode": null,
                    "attributeCode": null,
                    "id": 1023517
                },
                {
                    "entityId": 371022,
                    "entityObjectTypeId": null,
                    "entityObjectTypeCode": null,
                    "entityObjectTypeName": null,
                    "attributeValueId": 459568,
                    "attributeValue": null,
                    "attributeId": 1115,
                    "attributeValueFkName": null,
                    "attributeValueFkCode": null,
                    "attributeCode": null,
                    "id": 1023518
                }
            ],
            "entitiesRelationships": [],
            "relatedEntitiesRelationships": [],
            "appEntityTypes": 0,
            "ssin": "SO-00002452-000000000160",
            "tenantOwner": 2452,
            "timeStamp": "2025-05-11T13:55:33.5439387",
            "isDefault": false,
            "id": 371022
        }
    }


    ngOnInit(): void {
        this.getAppItemTypeExtraAttributesById()
         }
    async show(memberId?: number, accId?: number, isManualOrExternalContact?: boolean) {
        this.showMainSpinner()
        if (!this.uploader) this.initUploaders()
        this.isManualOrExternalContact = isManualOrExternalContact

        await this.getAttachmentCategories()

        this.getLanguages();
        this.getPhoneTypes();

        if (memberId != undefined) { // edit logic
            this.canEdit = this.permission.isGranted('Pages.Accounts.Member.Edit')
            if (!this.canEdit) return this.notify.error("You don't have permission to edit")
            await this.getContactDataForView(memberId)
        }
        else { // create logic
            this.canCreate = this.permission.isGranted('Pages.Accounts.Member.Create')
            if (!this.canCreate) return this.notify.error("You don't have permission to edit")
            this.memberDto = new ContactDto()
            this.memberDto.accountId = accId;
        }
        this.hideMainSpinner()

        this.phonelist.push(new Object(), new Object(), new Object());
        if (!this.memberDto.entityAttachments) {
            this.memberDto.entityAttachments = []
        }

        this.active = true;
    }
    setDefaultPublicFieldsToTrue() {
        this.memberDto.phone1IsPublic = this.memberDto.phone1Number || this.memberDto.phone1Ext || this.memberDto.phone1TypeId ? true : false;
        this.memberDto.phone2IsPublic = this.memberDto.phone2Number || this.memberDto.phone2Ext || this.memberDto.phone2TypeId ? true : false;
        this.memberDto.phone3IsPublic = this.memberDto.phone3Number || this.memberDto.phone3Ext || this.memberDto.phone3TypeId ? true : false;
        this.memberDto.joinDateIsPublic = this.memberDto.joinDate ? true : false;
        this.memberDto.languageIsPublic = this.memberDto.languageId || this.memberDto.languageName ? true : false;
        this.memberDto.emailAddressIsPublic = this.memberDto.eMailAddress ? true : false;
    }
    getLanguages(): void {
        this._AppEntitiesServiceProxy.getAllLanguageForTableDropdown().subscribe(result => {
            const lookupLabelDto: LookupLabelDto = new LookupLabelDto()
            lookupLabelDto.label = "None"
            lookupLabelDto.value = null
            this.allLanguages = [];
            this.allLanguages.push(lookupLabelDto, ...result)
        });
    }
    getPhoneTypes(): void {
        this._AppEntitiesServiceProxy.getAllPhoneTypeForTableDropdown().subscribe(result => {
            const lookupLabelDto: LookupLabelDto = new LookupLabelDto()
            lookupLabelDto.label = "None"
            lookupLabelDto.value = null
            this.allPhoneTypes = [];
            this.allPhoneTypes.push(lookupLabelDto, ...result)
            this.phonesLoaded = true
        });
    }
    async getAttachmentCategories() {
        this.getSycAttachmentCategoriesByCodes(['LOGO', "BANNER"]).subscribe((result) => {
            this.sycAttachmentCategoryLogo = result[0]
            this.sycAttachmentCategoryBanner = result[1]
        })
    }
    getAttachmentCategory(code: string) {
        return this._SycAttachmentCategoriesServiceProxy.getAll(
            undefined,
            code,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            0,
            1,
        )
            .toPromise();
    }

    async getContactDataForView(memberId) {
        const result = await this._AccountsServiceProxy.getContactForView(memberId).toPromise()
        if (result) this.memberDto = result.contact

        if (result?.contact?.joinDate)
            this.joinDate = moment(result?.contact?.joinDate).toDate();

        if (result?.coverUrl) this.coverPhoto = this.attachmentBaseUrl + '/' + result?.coverUrl
        if (result?.imageUrl) this.ProfileImg = this.attachmentBaseUrl + '/' + result?.imageUrl
        this.selectedBranchName = result?.branchName && result?.branchName != '' ? result?.branchName : '';
        this.selectedBranchName += result?.addressLine1 && result?.addressLine1 != '' ? (this.selectedBranchName != '' ? ' - ' + result?.addressLine1 : result?.addressLine1) : '';
        this.selectedBranchName += result?.addressLine2 && result?.addressLine2 != '' ? (this.selectedBranchName != '' ? ' , ' + result?.addressLine2 : result?.addressLine2) : '';
        this.selectedBranchName += result?.city && result?.city != '' ? (this.selectedBranchName != '' ? ' , ' + result?.city : result?.city) : '';
        this.selectedBranchName += result?.state && result?.state != '' ? (this.selectedBranchName != '' ? ' , ' + result?.state : result?.state) : '';
        this.selectedBranchName += result?.zipCode && result?.zipCode != '' ? (this.selectedBranchName != '' ? ' , ' + result?.zipCode : result?.zipCode) : '';
        this.selectedBranchName += result?.countryName && result?.countryName != '' ? (this.selectedBranchName != '' ? ' , ' + result?.countryName : result?.countryName) : '';
        this.selectedBranchId = result.contact.parentId;
    }

    onChangejoinDate() {
        let _joinDate = this.joinDate.toLocaleString();
        this.memberDto.joinDate = moment.utc(_joinDate);
    }

    getAccountBranches() {
        this._AccountsServiceProxy.getBranchForEdit(this.memberDto.accountId).subscribe((rootBranchData) => {
            const rootBranch: TreeNodeOfBranchForViewDto = new TreeNodeOfBranchForViewDto()
            rootBranch.expanded = false
            rootBranch.children = undefined
            rootBranch.leaf = false
            rootBranch.label = rootBranchData.name
            rootBranch.data = new BranchForViewDto()
            rootBranch.data.branch = rootBranchData
            rootBranch.data.id = rootBranchData.id
            this.branches = [rootBranch]
            if (this.branches?.length > 0) {
                this.selectBranchModal.show(this.branches);
            }
            else {
                this.message.info("No Branches Found");
            }
        })
    }


    preventFileBrowse($event) {
        $event.stopPropagation();
        let labelElement = $event.target.parentElement
        labelElement.onclick = (e) => e.preventDefault()
        setTimeout(() => labelElement.onclick = () => { }, 0)
    }

    removeImage($event, t: SycAttachmentCategoryDto, index) {
        let exidtedIndex: number = -1;
        exidtedIndex = this.memberDto.entityAttachments.findIndex(x => x.attachmentCategoryId == t.id);
        this.memberDto.entityAttachments.splice(exidtedIndex, 1)

        if (index == -1) {
            this.logoId = 0
            this.ProfileImg = undefined
        }
        else if (index == -2) {
            this.bannerId = 0
            this.coverPhoto = undefined
        }
    }
    imageBrowseDone($event: ImageUploadComponentOutput, sycAttachmentCategory: SycAttachmentCategoryDto) {
        let exidtedIndex: number = -1;
        let att: AppEntityAttachmentDto
        let guid = this.guid();


        exidtedIndex = this.memberDto.entityAttachments.findIndex(x => x.attachmentCategoryId == sycAttachmentCategory.id);

        if (exidtedIndex > -1) {
            att = this.memberDto.entityAttachments[exidtedIndex]
        } else {
            att = new AppEntityAttachmentDto();
        }
        att.fileName = $event.file.name;
        att.attachmentCategoryId = sycAttachmentCategory.id;
        att.guid = guid;

        if (this.sycAttachmentCategoryLogo.id == att.attachmentCategoryId) {
            this.ProfileImg = $event.image
        }
        else if (this.sycAttachmentCategoryBanner.id == att.attachmentCategoryId) {
            this.coverPhoto = $event.image
        }

        if (exidtedIndex == -1) {
            this.memberDto.entityAttachments.push(att);
        }

        this.uploader.addToQueue([$event.file]);

        this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
            form.append('guid', guid);
        };

        this.uploader.uploadAll()

        if (this.memberDto.entityAttachments == null || this.memberDto.entityAttachments == undefined) {
            this.memberDto.entityAttachments = [];
        }
    }

    //#region photo handling

    //#endregion
    //Branch Methods [Start]

    selectBranch() {
        this.getAccountBranches();
    }

    branchSelected(Branch) {
        this.selectedBranchName = Branch?.contactAddresses[0]?.name ? Branch?.contactAddresses[0]?.name : '';
        this.selectedBranchName += Branch?.contactAddresses[0]?.addressLine1 ? (this.selectedBranchName != '' ? ' - ' + Branch?.contactAddresses[0]?.addressLine1 : Branch?.contactAddresses[0]?.addressLine1) : '';
        this.selectedBranchName += Branch?.contactAddresses[0]?.addressLine2 ? (this.selectedBranchName != '' ? ' , ' + Branch?.contactAddresses[0]?.addressLine2 : Branch?.contactAddresses[0]?.addressLine2) : '';
        this.selectedBranchName += Branch?.contactAddresses[0]?.city ? (this.selectedBranchName != '' ? ' , ' + Branch?.contactAddresses[0]?.city : Branch?.contactAddresses[0]?.city) : '';
        this.selectedBranchName += Branch?.contactAddresses[0]?.state ? (this.selectedBranchName != '' ? ' , ' + Branch?.contactAddresses[0]?.state : Branch?.contactAddresses[0]?.state) : '';
        this.selectedBranchName += Branch?.contactAddresses[0]?.zipCode ? (this.selectedBranchName != '' ? ' , ' + Branch?.contactAddresses[0]?.zipCode : Branch?.contactAddresses[0]?.zipCode) : '';
        this.selectedBranchName += Branch?.contactAddresses[0]?.countryName ? (this.selectedBranchName != '' ? ' , ' + Branch?.contactAddresses[0]?.countryName : Branch?.contactAddresses[0]?.countryName) : '';
        this.selectedBranchId = Branch.id;
        this.memberDto.parentId = Branch.id;
    }
    branchSelectionCanceled() {
        this.selectBranchModal.close();
    }

    //Branch Methods [End]


    async SaveMember() {
        if (this.uploader.isUploading) {
            return this.notify.error(this.l("PleaseWait,SomeAttachmentsAreStillUploading"));
        }
        if (this.isManualOrExternalContact) this.setDefaultPublicFieldsToTrue()
        this.showMainSpinner()
        if (!this.memberDto.code) {
            let sequance = "";
            let tenancyName = this.appSession.tenancyName;

            const getNextEntityCodeRes = await this._sycIdentifierDefinitionsServiceProxy.getNextEntityCode(this.entityObjectType).toPromise()
            if (getNextEntityCodeRes)
                sequance = getNextEntityCodeRes;

            this.memberDto.code = tenancyName + "-C" + sequance;
        }
        this._AccountsServiceProxy.createOrEditContact(this.memberDto)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(result => {
                const userId = this.memberDto?.userId || result.userId
                const memberId = this.memberDto?.id || result.id
                const isMyProfile = this.appSession?.user?.memberId == this.memberDto?.id
                if (isMyProfile) {
                    const profileImage = this.memberDto?.entityAttachments?.filter(item => item.attachmentCategoryId == this.sycAttachmentCategoryLogo.id)[0]
                    if (profileImage?.guid) {
                        this.updateLogoService.updateProfilePicture()
                    }
                }
                this.createOrEditDone.emit({ userId: userId, memberId: memberId });
            });
    }

    AddPhoneToList() {
        this.phonelist.push(new Object());
    }

    removePhoneFromList(i: number) {
        this.phonelist.splice(i, 1)
        this.memberDto[`phone${i + 1}Ext`] = undefined
        this.memberDto[`phone${i + 1}IsPublic`] = undefined
        this.memberDto[`phone${i + 1}CountryKey`] = undefined
        this.memberDto[`phone${i + 1}Number`] = undefined
        this.memberDto[`phone${i + 1}TypeId`] = undefined
        this.memberDto[`phone${i + 1}TypeName`] = undefined
    }

    hasErrorphoneNumber(e, i: number) {
    }

    getNumberphoneNumber(e, i: number) {

    }

    onExtentionChange(value, i) {
        this.memberDto[`phone${i + 1}Ext`] = value
    }

    onPhoneTypeChange($event: { value: number, originalEvent }, i: number) {
        const label = $event?.originalEvent?.target?.innerText
        this.memberDto[`phone${i + 1}TypeName`] = label
    }

    onPhoneNumberChange(value, i) {
        this.memberDto[`phone${i + 1}Number`] = value
    }

    onIsPublicChange(value, i) {
        this.memberDto[`phone${i + 1}IsPublic`] = value
    }

    telInputObjectphoneNumber(obj, i: number) {
        const key = `phone${i + 1}CountryKey`
        if (!isNaN(i) && !this.memberDto[key]) {
            this.memberDto[key] = 'us'
            obj.setCountry(this.memberDto[key]);
        }
    }
    onCountryChangephoneNumber(e, i: number) {
        this.memberDto[`phone${i + 1}CountryKey`] = e.iso2
    }

    hide() {
        this.active = false
        this.memberDto = undefined
        this.memberForm?.reset()
        this.phonelist = []
        this.allLanguages = []
        this.allPhoneTypes = []
        this.selectedBranchId = undefined
        this.selectedBranchName = undefined
        this.branches = []
        this.ProfileImg = undefined
        this.coverPhoto = undefined
        this.logoId = undefined

    }

    groupAttributesByUsage(attrs: any[]): any {
        return attrs.reduce((acc, attr) => {
          const usage = attr.usage || 'UNSPECIFIED';
          if (!acc[usage]) acc[usage] = [];
          acc[usage].push(attr);
          return acc;
        }, {});
      }
    
      selectUsage(usage: string): void {
        this.selectedUsage = usage;
      }
      
    
        
    defineExtraAttributes() {
      this.extraAttributes = {};
    
      const allAttributes = this.selectedTransTypeData?.extraAttributes?.extraAttributes ?? [];
    
      allAttributes.forEach(attr => {
        const usageKey = attr.usage?.replace(/\s+/g, '_').toUpperCase() || 'DEFAULT';
    
        if (!this.extraAttributes[usageKey]) {
          this.extraAttributes[usageKey] = new CreateEditAppItemExtraAttribute({
            header: this.l(attr.usage),
            title: this.l(attr.usage),
            usageEnum: usageKey as unknown as EExtraAttributeUsage,
            orderOfDisplay: 1,
            filteredExtraAttributes: [],
            extraAttributes: []
          });
        }
    
        // ✅ Add this if missing
        if (!attr.paginationSetting) {
          attr.paginationSetting = {
            skipCount: 0,
            maxResultCount: 10,
            totalCount: 0,
            list: []
          };
        }
     
          
          
        this.extraAttributes[usageKey].filteredExtraAttributes.push(attr);
      });
    
    }
    
    getAppItemTypeExtraAttributesById() {
        this._sycEntityObjectTypesServiceProxy.getAllWithExtraAttributes(723)
          .subscribe((res) => {
            if (res?.length > 0) {
              this.allAttributes = res[0]?.extraAttributes.extraAttributes;
      
              // Group attributes by `usage`
              this.groupedByUsage = this.groupAttributesByUsage(this.allAttributes);
              this.usageList = Object.keys(this.groupedByUsage);
              this.selectedUsage = this.usageList[0];
      
              // ✅ Initialize extraAttributes before using it
              this.selectedTransTypeData = res[0]; // ensure defineExtraAttributes uses correct data
              this.defineExtraAttributes();
      
              this.loadRecommendedAndAdditionalExtraDataLookupLists();
    
              setTimeout(() => this.scrollToUsage(this.selectedUsage), 200);
            }
          });
      }
      
    
    
      loadRecommendedAndAdditionalExtraDataLookupLists() {
        if (!this.extraAttributes || typeof this.extraAttributes !== 'object') {
          return;
        }
      
        Object.keys(this.extraAttributes).forEach(key => {
          const group = this.extraAttributes[key];
          group.filteredExtraAttributes.forEach(extraAttr => {
            if (extraAttr.isLookup) {
              this.loadExtraDataLookupList(extraAttr);
            }
          });
        });
      }
      
    
      loadExtraDataLookupList(extraAttr: FilteredExtraAttribute) {
          this._extraAttributeDataService
              .getExtraAttributeLookupDataWithPaging(
                extraAttr.entityObjectTypeCode,
                extraAttr.paginationSetting.skipCount,
                extraAttr.paginationSetting.maxResultCount
              )
              .subscribe((result) => {
                  extraAttr.paginationSetting.totalCount = result.totalCount;
                  if (extraAttr.paginationSetting.skipCount == 0)
                      extraAttr.paginationSetting.list = [];
                  else
                      extraAttr.paginationSetting.list.splice(
                          extraAttr.paginationSetting.list.length - 1,
                          1
                      );
                       let isExist=result.items.filter((item)=>{ return item.value==extraAttr.attributeId});
                      if((isExist!.length==0||isExist==undefined)  && extraAttr?.selectedValues?.length>0){
    
                          const tempAtt = new LookupLabelDto({
                              code:extraAttr.code,
                              label:extraAttr.selectedValues,
                              stockAvailability:undefined,
                              value:extraAttr.selectedValues,
                              isHostRecord:false,
                              hexaCode:undefined,
                              image:undefined
                          })
                          result.items.push(tempAtt)
                      }
    
                  extraAttr.paginationSetting.list.push(...result.items);
                  if (
                      extraAttr.paginationSetting.list.length <
                      extraAttr.paginationSetting.totalCount
                  ) {
                      const showMoreSelectItem: SelectItem = {
                          value: -1,
                          label: this.l("showMore"),
                          icon: "fas  fa-reply",
                          styleClass: "showMore",
                          disabled: false,
                      };
                      extraAttr.paginationSetting.list.push(showMoreSelectItem);
                  }
                  extraAttr.paginationSetting.skipCount +=
                      extraAttr.paginationSetting.maxResultCount;
              });
      }
    
      scrollToUsage(usage: string): void {
        this.selectedUsage = usage;
      
        const index = this.usageList.indexOf(usage);
        if (index !== -1) {
          // Expand only the clicked tab
          this.activeAccordionIndexes = [index];
      
          // Scroll to the section
          setTimeout(() => {
            const element = document.getElementById('usage_' + usage);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 100);
        }
      }
      
      onExtraAttributesChanged(dataFromChild: any[]) {
   
        if (!this.appTransactionsForViewDto) {
          this.appTransactionsForViewDto = new GetAppTransactionsForViewDto();
        }
    
        if (!this.appTransactionsForViewDto.entityExtraData) {
          this.appTransactionsForViewDto.entityExtraData = [];
        }
    
        const existingData = this.appTransactionsForViewDto.entityExtraData;
    
        // Step 1: Map incoming data cleanly
        const incomingData: AppEntityExtraDataDto[] = dataFromChild.flatMap(attr => {
          if (attr.isLookup && attr.acceptMultipleValues) {
            return (attr.value || []).map(v => {
              const d = new AppEntityExtraDataDto();
              d.attributeId = attr.attributeId;
              d.attributeValueId = v;
              return d;
            });
          } else {
            const dto = new AppEntityExtraDataDto();
            dto.attributeId = attr.attributeId;
            if (attr.isLookup) {
              dto.attributeValueId = attr.value;
            } else {
              dto.attributeValue = attr.value;
            }
            return dto;
          }
        });
    
        // ✅ Step 2: No filter — keep all values
        const cleanIncomingData = incomingData;
    
        // Step 3: Remove old entries for incoming attributeIds
        const incomingAttributeIds = new Set(cleanIncomingData.map(d => d.attributeId));
        const filteredExistingData = existingData.filter(
          d => !incomingAttributeIds.has(d.attributeId)
        );
    
        // Step 4: Merge clean incoming data
        const finalData = [...filteredExistingData, ...cleanIncomingData];
        console.log(finalData,'finalData')
    
        this.appTransactionsForViewDto.entityExtraData = finalData;
    
      }
    
    
    
      onExtraAttributeCleared(attributeId: number) {
        const data = this.appTransactionsForViewDto?.entityExtraData;
        if (data && data.length > 0) {
          let index = -1;
          while ((index = data.findIndex(x => x.attributeId === attributeId)) !== -1) {
            data.splice(index, 1);
          }
    
        }
      }
      
}

