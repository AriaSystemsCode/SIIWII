import { ModalDirective } from 'ngx-bootstrap/modal';
import { AccountsServiceProxy, AppEntitiesServiceProxy, SycAttachmentCategoriesServiceProxy, AppEntityAttachmentDto, TreeNodeOfBranchForViewDto, LookupLabelDto, BranchForViewDto, SycIdentifierDefinitionsServiceProxy, SycAttachmentCategoryDto, SycEntityObjectTypesServiceProxy, GetAllEntityObjectTypeOutput, AppEntityExtraDataDto, CreateOrEditAccountInfoDto, GetAccountForViewDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ViewChild, Component, EventEmitter, Injector, Output, Input, ChangeDetectorRef } from '@angular/core';
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
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
@Component({
  selector: 'app-create-or-edit-member',
  templateUrl: './create-or-edit-member.component.html',
  styleUrls: ['./create-or-edit-member.component.scss'],
  animations: [appModuleAnimation()]
})
export class CreateOrEditMemberComponent extends AppComponentBase {
  @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
  // @ViewChild('selectBranchModal', { static: true }) selectBranchModal: SelectBranchModalComponent;
  @ViewChild('memberForm', { static: true }) memberForm: NgForm
  @Output() createOrEditDone = new EventEmitter<{ memberId: number, userId: number }>();
  @Input() accData:  GetAccountForViewDto;
  @Input('showHeader') showHeader: boolean = true
  memberDto: CreateOrEditAccountInfoDto;

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
  entityObjectType: string = "BUSINESS";
  joinDate = new Date();


  isManualOrExternalContact: boolean = true
  sycAttachmentCategoryLogo: SycAttachmentCategoryDto
  sycAttachmentCategoryBanner: SycAttachmentCategoryDto

  selectedBranchId: number
  selectedBranchName: string



  data: any
  allAttributes = []; // flat list from API
  groupedByUsage = {}; // { RECOMMENDED: [], ADDITIONAL: [] }
  usageList: string[] = []; // for sidebar
  selectedUsage: string;


  selectedTransactionTypeData: GetAllEntityObjectTypeOutput = new GetAllEntityObjectTypeOutput();
  selectedTransTypeData: any
  extraAttributes: any;

  activeAccordionIndexes: number[] = [0]; // open first tab by default
  hasUnsavedChanges = false;

  joinDateModel: Date | null = null;
selectBranchModalRef: BsModalRef;
  constructor(injector: Injector,
    private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,
    private _SycAttachmentCategoriesServiceProxy: SycAttachmentCategoriesServiceProxy,
    private _AccountsServiceProxy: AccountsServiceProxy,
    private _sycIdentifierDefinitionsServiceProxy: SycIdentifierDefinitionsServiceProxy,
    private updateLogoService: UpdateLogoService,
    private _sycEntityObjectTypesServiceProxy: SycEntityObjectTypesServiceProxy,
    private _extraAttributeDataService: ExtraAttributeDataService,
    private _bsModalService: BsModalService,
    private cdr: ChangeDetectorRef
  ) {
    super(injector);

  }


  ngOnInit(): void {

  }
  async show(memberId?: number, accId?: number, isManualOrExternalContact?: boolean) {
    this.showMainSpinner();
    if (!this.uploader) this.initUploaders();
    this.isManualOrExternalContact = isManualOrExternalContact;
  
    await this.getAttachmentCategories();
    this.getLanguages();
    this.getPhoneTypes();
  
    if (memberId != undefined) { // edit logic
      this.canEdit = this.permission.isGranted('Pages.Accounts.Member.Edit');
      if (!this.canEdit) return this.notify.error("You don't have permission to edit");
  
      await this.getContactDataForView(memberId); //  fills memberDto
     
      // this.getAppItemTypeExtraAttributesById(); //  call AFTER memberDto is filled
    } else { // create logic
      this.canCreate = this.permission.isGranted('Pages.Accounts.Member.Create');
      if (!this.canCreate) return this.notify.error("You don't have permission to create");
  
      this.memberDto = new CreateOrEditAccountInfoDto();
      this.memberDto.accountId = accId;
  
    }
  
    this.phonelist.push(new Object(), new Object(), new Object());
  
    if (!this.memberDto.entityAttachments) this.memberDto.entityAttachments = [];
  
    if (!this.memberDto.code) {
      const sequance = await this._sycIdentifierDefinitionsServiceProxy.getNextEntityCode(this.entityObjectType, null).toPromise();
      this.memberDto.code = "C" + sequance;
    }

    this.active = true;
    this.hideMainSpinner();
  }
  
  setDefaultPublicFieldsToTrue() {
    this.setBooleanValue(710, this.memberDto.phone1Number || this.memberDto.phone1Ex || this.memberDto.phone1TypeId ? true : false);
    this.setBooleanValue(711, this.memberDto.phone2Number || this.memberDto.phone2Ex || this.memberDto.phone2TypeId ? true : false);
    this.setBooleanValue(712, this.memberDto.phone3Number || this.memberDto.phone3Ex || this.memberDto.phone3TypeId ? true : false);
    this.setBooleanValue(713, this.memberDto.joinDate ? true : false); // Assuming 707 = Join Date Is Public
    this.setBooleanValue(708, this.memberDto.languageId || this.memberDto.languageName ? true : false);
    this.setBooleanValue(709, this.memberDto.eMailAddress ? true : false); // If needed
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
    const result = await this._AccountsServiceProxy.getAppContactForView(memberId).toPromise()
    if (result)
      // this.memberDto = result.contact
      this.memberDto = Object.assign(new CreateOrEditAccountInfoDto(), result);
      this.memberDto.emailAddressIsPublic = true

  // set join date model once
  const iso = this.memberDto?.extraDataAttributes
    ?.find(a => a.extraAttributeId === 707)
    ?.selectedValues?.at(-1)?.value as string | undefined;

  this.joinDateModel = iso ? new Date(iso) : null;

    // if (result?.coverUrl) this.coverPhoto = this.attachmentBaseUrl + '/' + result?.coverUrl
    // if (result?.imageUrl) this.ProfileImg = this.attachmentBaseUrl + '/' + result?.imageUrl
    // const logoAttachment = this.memberDto?.entityAttachments?.find(att => att.attachmentCategoryId === 1 && att.url);

    // if (logoAttachment) {
    // this.ProfileImg = this.attachmentBaseUrl + '/' + logoAttachment.url;
    // }

    // const coverAttachment = this.memberDto?.entityAttachments?.find(att => att.attachmentCategoryId === 2 && att.url);

    // if (logoAttachment) {
    // this.coverPhoto = this.attachmentBaseUrl + '/' + coverAttachment.url;
    // }

    const logoAttachment = this.memberDto?.entityAttachments?.find(
  att => att.attachmentCategoryId === 1 && !!att.url
);

this.ProfileImg = logoAttachment?.url
  ? `${this.attachmentBaseUrl}/${logoAttachment.url}`
  : undefined;

const coverAttachment = this.memberDto?.entityAttachments?.find(
  att => att.attachmentCategoryId === 2 && !!att.url
);

this.coverPhoto = coverAttachment?.url
  ? `${this.attachmentBaseUrl}/${coverAttachment.url}`
  : undefined;
    this.selectedBranchName = result?.branchName && result?.branchName != '' ? result?.branchName : '';
    this.selectedBranchName += result?.addressLine1 && result?.addressLine1 != '' ? (this.selectedBranchName != '' ? ' - ' + result?.addressLine1 : result?.addressLine1) : '';
    this.selectedBranchName += result?.addressLine2 && result?.addressLine2 != '' ? (this.selectedBranchName != '' ? ' , ' + result?.addressLine2 : result?.addressLine2) : '';
    this.selectedBranchName += result?.city && result?.city != '' ? (this.selectedBranchName != '' ? ' , ' + result?.city : result?.city) : '';
    this.selectedBranchName += result?.state && result?.state != '' ? (this.selectedBranchName != '' ? ' , ' + result?.state : result?.state) : '';
    this.selectedBranchName += result?.zipCode && result?.zipCode != '' ? (this.selectedBranchName != '' ? ' , ' + result?.zipCode : result?.zipCode) : '';
    this.selectedBranchName += result?.countryName && result?.countryName != '' ? (this.selectedBranchName != '' ? ' , ' + result?.countryName : result?.countryName) : '';
    this.selectedBranchId = result.parentId;


  }

  // onChangejoinDate() {
  //   let _joinDate = this.joinDate.toLocaleString();
  //   this.memberDto.joinDate = moment.utc(_joinDate);
  // }

  onChangejoinDate() {
    const _joinDate = this.joinDate?.toLocaleString();
    const joinDateAttr = this.memberDto?.extraDataAttributes?.find(attr => attr.extraAttributeId === 707);
    if (joinDateAttr) {
      joinDateAttr.selectedValues = [{
        ...joinDateAttr.selectedValues?.[joinDateAttr.selectedValues.length - 1],
        value: moment.utc(_joinDate).format() // Store ISO string
        ,
        init: function (_data?: any): void {},
        toJSON: function (data?: any) {}
      }];
    }
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
        // this.selectBranchModal.show(this.branches);
        this.openSelectBranchModal(this.branches);
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

  branchSelected(raw: any) {
    const b = raw?.branch ?? raw;                // support both shapes
    if (!b) return;
  
    const addr = Array.isArray(b.contactAddresses) && b.contactAddresses.length
      ? b.contactAddresses[0]
      : null;
  
    const parts = [
      b.name,                                    // always include name
      addr?.addressLine1,
      addr?.addressLine2,
      addr?.city,
      addr?.state,
      addr?.postalCode,
      addr?.countryIdName,
    ].filter(p => !!p && p !== '');
  
    this.selectedBranchName = parts.join(' , '); // what the input shows
    this.selectedBranchId = b.id;
    this.memberDto.parentId = b.id;
  
    const node = new TreeNodeOfBranchForViewDto();
    node.data = BranchForViewDto.fromJS({ branch: b, subTotal: 0, id: b.id });
    node.label = b.name || '';
    node.leaf = true;
    node.expanded = true;
    node.children = [];
    node.totalChildrenCount = 0;
    this.memberDto.branches = [node];
  
    this.cdr.detectChanges();                    // ensure UI refresh in case modal runs outside Angular zone
  }

  // branchSelectionCanceled() {
  //   this.selectBranchModal.close();
  // }
branchSelectionCanceled() {
  this.selectBranchModalRef?.hide();
}
  //Branch Methods [End]


  async SaveMember() {
    if (this.uploader.isUploading) {
      return this.notify.error(this.l("PleaseWait,SomeAttachmentsAreStillUploading"));
    }

    if (this.isManualOrExternalContact) this.setDefaultPublicFieldsToTrue();

    this.showMainSpinner();

    if (!this.memberDto.code) {
      const sequance = await this._sycIdentifierDefinitionsServiceProxy.getNextEntityCode(this.entityObjectType, null).toPromise();
      this.memberDto.code = "C" + sequance
    }

    this.memberDto.useDTOTenant = true;
 
    this.memberDto.name = this.getStringValue(701) + ' ' + this.getStringValue(702)
    const cleanDto = new CreateOrEditAccountInfoDto();

    const allowedKeys = [
      'fileToken','tradeName','accountType','accountTypeId','ssin','priceLevel','notes','website','name','code',
      'phone1Number','phone1Ex','phone2Number','phone2Ex','phone3Number','phone3Ex','eMailAddress',
      'phone1TypeId','phone2TypeId','phone3TypeId','currencyId','languageId','entityId','tenantId',
      'attachmentSourceTenantId','useDTOTenant','returnId','accountLevel','entityCategories','entityClassifications',
      'entityAttachments','branches','contactAddresses','contactPaymentMethods','entityExtraData','id','parentId','accountId'
    ];
    
    for (const key of allowedKeys) (cleanDto as any)[key] = (this.memberDto as any)[key];
    
    // Safety: make sure we never send UI-only field even if present
    (delete (cleanDto as any).extraDataAttributes);
    
    // Ensure proper DTO instances in arrays that get serialized
    cleanDto.entityExtraData = (cleanDto.entityExtraData || []).map(d => {
      const dto = new AppEntityExtraDataDto();
      dto.attributeId = d.attributeId;
      dto.attributeValue = d.attributeValue ?? undefined;
      dto.attributeValueId = d.attributeValueId ?? undefined;
      return dto;
    });


    this._AccountsServiceProxy.createOrUpdateContact(cleanDto)
      .pipe(finalize(() => this.hideMainSpinner()))
      .subscribe(result => {
        const userId = this.memberDto?.userId || result.userId;
        const memberId = this.memberDto?.id || result.id;

        const isMyProfile = this.appSession?.user?.memberId == this.memberDto?.id;
        if (isMyProfile) {
          const profileImage = this.memberDto?.entityAttachments?.find(
            x => x.attachmentCategoryId === this.sycAttachmentCategoryLogo.id
          );
          if (profileImage?.guid) {
            this.updateLogoService.updateProfilePicture();
          }
        }

        this.createOrEditDone.emit({ userId, memberId });
      });
  }

  AddPhoneToList() {
    this.phonelist.push(new Object());
  }

  removePhoneFromList(i: number) {
    this.phonelist.splice(i, 1)
    this.memberDto[`phone${i + 1}Ex`] = undefined
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
    this.memberDto[`phone${i + 1}Ex`] = value
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
    // this.memberDto = undefined
    // this.memberForm?.reset()
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

      //  Add this if missing
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
    const typeId = this.accData?.accountTypeId || this.memberDto?.accountTypeId;
    if (!typeId) return;
  
    this._sycEntityObjectTypesServiceProxy.getAllWithExtraAttributes(typeId)
      .subscribe((res) => {
        if (res?.length > 0) {
          this.allAttributes = res[0]?.extraAttributes.extraAttributes;
          this.groupedByUsage = this.groupAttributesByUsage(this.allAttributes);
          this.usageList = Object.keys(this.groupedByUsage);
          this.selectedUsage = this.usageList[0];
          this.selectedTransTypeData = res[0];
          this.defineExtraAttributes();
          this.loadRecommendedAndAdditionalExtraDataLookupLists();
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
        let isExist = result.items.filter((item) => { return item.value == extraAttr.attributeId });
        if ((isExist!.length == 0 || isExist == undefined) && extraAttr?.selectedValues?.length > 0) {

          const tempAtt = new LookupLabelDto({
            code: extraAttr.code,
            label: extraAttr.selectedValues,
            stockAvailability: undefined,
            value: extraAttr.selectedValues,
            isHostRecord: false,
            hexaCode: undefined,
            image: undefined,
            status:undefined,
            entityObjectStatusId: undefined,
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

 

  onExtraAttributesChanged(dataFromChild: any[]) {

    if (!this.memberDto) {
      this.memberDto = new CreateOrEditAccountInfoDto();
    }

    if (!this.memberDto.entityExtraData) {
      this.memberDto.entityExtraData = [];
    }

    const existingData = this.memberDto.entityExtraData;

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


    this.memberDto.entityExtraData = finalData;

  }



  onExtraAttributeCleared(attributeId: number) {
    const data = this.memberDto?.entityExtraData;
    if (data && data.length > 0) {
      let index = -1;
      while ((index = data.findIndex(x => x.attributeId === attributeId)) !== -1) {
        data.splice(index, 1);
      }

    }
  }


  populateSavedExtraAttributeValues() {
    if (!this.memberDto?.entityExtraData?.length || !this.allAttributes?.length) return;
  
    for (const attr of this.allAttributes) {
      const matches = this.memberDto.entityExtraData.filter(d => d.attributeId === attr.attributeId);
  
      if (matches.length) {
        if (attr.isLookup && attr.acceptMultipleValues) {
          attr.value = matches.map(m => m.attributeValueId);
        } else if (attr.isLookup) {
          attr.value = matches[0].attributeValueId;
        } else {
          attr.value = matches[0].attributeValue;
        }
  
        // ✅ Optional: store selectedValues for UI binding
        attr.selectedValues = attr.value;
      }
    }
  }
  get jobTitleAttr() {
    return this.memberDto?.extraDataAttributes?.find(attr => attr.extraAttributeId === 706);
  }
  getJoinDateAsDate(): Date | null {
    const joinDateAttr = this.memberDto?.extraDataAttributes?.find(attr => attr.extraAttributeId === 707);
    const val = joinDateAttr?.selectedValues?.[joinDateAttr.selectedValues.length - 1]?.value;
    return val ? new Date(val) : null;
  }
  
  onChangejoinDateFromPicker(date: Date) {
    this.joinDateModel = date;
    const iso = moment.utc(date).format();
    const joinDateAttr = this.memberDto?.extraDataAttributes?.find(a => a.extraAttributeId === 707);
    if (joinDateAttr) {
      if (!joinDateAttr.selectedValues?.length) {
        joinDateAttr.selectedValues = [{ value: iso, init() {}, toJSON() {} } as any];
      } else {
        joinDateAttr.selectedValues.at(-1)!.value = iso;
      }
    }
    this.upsertEntityExtraData(707, iso);
  }
  
  
  
  getJoinDateIsPublic(): boolean {
    const attr = this.memberDto?.extraDataAttributes?.find(attr => attr.extraAttributeId === 713);
    const val = attr?.selectedValues?.[attr.selectedValues.length - 1]?.value;
    return val === 'true' ;
  }
  
  setJoinDateIsPublic(val: boolean) {
    const attr = this.memberDto?.extraDataAttributes?.find(attr => attr.extraAttributeId === 713);
    if (attr) {
      attr.selectedValues = [{
        ...attr.selectedValues?.[attr.selectedValues.length - 1], value: val.toString(),
        init: function (_data?: any): void {},
        toJSON: function (data?: any) {}
      }];
    }
  }



  getBooleanValue(attrId: number): boolean {
    const attr = this.memberDto?.extraDataAttributes?.find(x => x.extraAttributeId === attrId);
    const v = attr?.selectedValues?.[0]?.value ?? '';
    return v.toString().toLowerCase() === 'true';
  }
  
  setBooleanValue(attrId: number, checked: boolean): void {
    const attr = this.memberDto?.extraDataAttributes?.find(x => x.extraAttributeId === attrId);
    // keep UI state in extraDataAttributes if it exists
    if (attr) {
      if (!attr.selectedValues || attr.selectedValues.length === 0) {
        attr.selectedValues = [{ value: checked.toString(), init() {}, toJSON() {} } as any];
      } else {
        attr.selectedValues[attr.selectedValues.length - 1].value = checked.toString();
      }
    }
    // always persist to entityExtraData
    this.upsertEntityExtraData(attrId, checked.toString());
  }
  
  getStringValue(attrId: number): string {
    const attr = this.memberDto?.extraDataAttributes?.find(a => a.extraAttributeId === attrId);
    return attr?.selectedValues?.[attr.selectedValues.length - 1]?.value ?? '';
  }
  
  setStringValue(attrId: number, val: string): void {
 
    if (!this.memberDto.extraDataAttributes) this.memberDto.extraDataAttributes = [];
    let attr = this.memberDto.extraDataAttributes.find(a => a.extraAttributeId === attrId) as any;
    if (!attr) {
      attr = { extraAttributeId: attrId, selectedValues: [] };
      this.memberDto.extraDataAttributes.push(attr);
    }
    if (!attr.selectedValues || attr.selectedValues.length === 0) {
      attr.selectedValues = [{ value: val, init() {}, toJSON() {} }];
    } else {
      attr.selectedValues[attr.selectedValues.length - 1].value = val;
    }
  

    this.upsertEntityExtraData(attrId, val);
  }
  
  private upsertEntityExtraData(attrId: number, value?: string, valueId?: number) {
    if (!this.memberDto.entityExtraData) this.memberDto.entityExtraData = [];
  
    let row = this.memberDto.entityExtraData.find(d => d.attributeId === attrId);
    if (!row) {
      row = new AppEntityExtraDataDto();
      row.attributeId = attrId;
      this.memberDto.entityExtraData.push(row);
    }
    // Assign either plain value or lookup id
    if (valueId != null) {
      row.attributeValueId = valueId;
      row.attributeValue = undefined as any;
    } else {
      row.attributeValue = value ?? null as any;
      row.attributeValueId = undefined as any;
    }
  }
  

  openSelectBranchModal(branches: TreeNodeOfBranchForViewDto[]): void {
  const config: ModalOptions = new ModalOptions();

  config.class = 'right-modal slide-right-in';
  config.initialState = {
    branchesInput: branches
  };

  const modalRef = this._bsModalService.show(SelectBranchModalComponent, config);
  this.selectBranchModalRef = modalRef;

  const content = modalRef.content as SelectBranchModalComponent;

  content.branchSelected.subscribe((branch) => {
    this.branchSelected(branch);
  });

  content.BranchSelectionCanceled.subscribe(() => {
    this.branchSelectionCanceled();
  });
}

}