import {
  AccountsServiceProxy, AppEntitiesServiceProxy, AppEntityAttachmentDto, LookupLabelDto,
  SycIdentifierDefinitionsServiceProxy, SycAttachmentCategoryDto, SycEntityObjectTypesServiceProxy,
  AppEntityExtraDataDto, CreateOrEditAccountInfoDto, GetAccountForViewDto
} from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Component, EventEmitter, Injector, Input, Output } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { ImageUploadComponentOutput } from '@app/shared/common/image-upload/image-upload.component';
import { UpdateLogoService } from '@shared/utils/update-logo.service';
import {
  RELATION_ATTR, RELATION_ENTITY_TYPE, RELATION_DEFINITION_CODE,
  extractRelationAttributes, buildRelationInputs, collectRelationChanges,
  clearRelationChange, applyRelationChanges
} from '../../models/relation-settings.helper';


@Component({
  selector: 'app-create-or-edit-member',
  templateUrl: './create-or-edit-member.component.html',
  styleUrls: ['./create-or-edit-member.component.scss'],
  animations: [appModuleAnimation()]
})
export class CreateOrEditMemberComponent extends AppComponentBase {
  @Output() createOrEditDone = new EventEmitter<{ memberId: number, userId: number }>();

  @Input() accData: GetAccountForViewDto;

  memberDto: CreateOrEditAccountInfoDto;
  active = false;
  phonesLoaded = false;
  isManualOrExternalContact = true;
  readonly entityObjectType = 'BUSINESS';

  ProfileImg: any;
  coverPhoto: any;
  sycAttachmentCategoryLogo: SycAttachmentCategoryDto;
  sycAttachmentCategoryBanner: SycAttachmentCategoryDto;

  allPhoneTypes: LookupLabelDto[];
  allLanguages: LookupLabelDto[];
  phonelist: object[] = [];

  // Relationship settings (Job title / Join date / Branch)
  relationAttributes: any[] = [];
  relationAttributeObject: any = null;
  relationEntityObjectTypeId: number;
  relationInputsDto: any = null;
  private relationChanges = new Map<number, any>();

  constructor(
    injector: Injector,
    private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,
    private _AccountsServiceProxy: AccountsServiceProxy,
    private _sycIdentifierDefinitionsServiceProxy: SycIdentifierDefinitionsServiceProxy,
    private updateLogoService: UpdateLogoService,
    private _sycEntityObjectTypesServiceProxy: SycEntityObjectTypesServiceProxy
  ) {
    super(injector);
  }

  // ---------------------------------------------------------------- show / hide

  async show(memberId?: number, accId?: number, isManualOrExternalContact?: boolean) {
    const isEdit = memberId != undefined;

    // permission check first, so the spinner is never left running
    if (!this.permission.isGranted(isEdit ? 'Pages.Accounts.Member.Edit' : 'Pages.Accounts.Member.Create')) {
      return this.notify.error(isEdit ? "You don't have permission to edit" : "You don't have permission to create");
    }

    this.showMainSpinner();
    if (!this.uploader) this.initUploaders();
    this.isManualOrExternalContact = isManualOrExternalContact;

    this.getAttachmentCategories();
    this.getLanguages();
    this.getPhoneTypes();

    if (isEdit) {
      await this.getContactDataForView(memberId);
    } else {
      this.memberDto = new CreateOrEditAccountInfoDto();
      this.memberDto.accountId = accId;
    }

    // Relationship settings for both create and edit
    this.relationChanges.clear();
    this.relationAttributeObject = null;
    this.relationInputsDto = null;
    this.loadRelationAttributes();

    this.phonelist = [{}, {}, {}];
    if (!this.memberDto.entityAttachments) this.memberDto.entityAttachments = [];

    if (!this.memberDto.code) {
      const sequence = await this._sycIdentifierDefinitionsServiceProxy.getNextEntityCode(this.entityObjectType, null).toPromise();
      this.memberDto.code = 'C' + sequence;
    }

    this.active = true;
    this.hideMainSpinner();
  }

  hide() {
    this.active = false;
    this.phonelist = [];
    this.allLanguages = [];
    this.allPhoneTypes = [];
    this.ProfileImg = undefined;
    this.coverPhoto = undefined;
    this.relationChanges.clear();
    this.relationAttributeObject = null;
    this.relationInputsDto = null;
  }

  // ---------------------------------------------------------------- lookups

  private withNone(items: LookupLabelDto[]): LookupLabelDto[] {
    const none = new LookupLabelDto();
    none.label = 'None';
    none.value = null;
    return [none, ...items];
  }

  getLanguages(): void {
    this._AppEntitiesServiceProxy.getAllLanguageForTableDropdown().subscribe(result => {
      this.allLanguages = this.withNone(result);
    });
  }

  getPhoneTypes(): void {
    this._AppEntitiesServiceProxy.getAllPhoneTypeForTableDropdown().subscribe(result => {
      this.allPhoneTypes = this.withNone(result);
      this.phonesLoaded = true;
    });
  }

  getAttachmentCategories() {
    this.getSycAttachmentCategoriesByCodes(['LOGO', 'BANNER']).subscribe(result => {
      this.sycAttachmentCategoryLogo = result[0];
      this.sycAttachmentCategoryBanner = result[1];
    });
  }

  // ---------------------------------------------------------------- load

  private async getContactDataForView(memberId: number) {
    const result = await this._AccountsServiceProxy.getAppContactForView(memberId).toPromise();
    this.memberDto = Object.assign(new CreateOrEditAccountInfoDto(), result);

    const urlOf = (categoryId: number) => {
      const url = this.memberDto.entityAttachments?.find(a => a.attachmentCategoryId === categoryId && a.url)?.url;
      return url ? this.attachmentBaseUrl + '/' + url : undefined;
    };
    this.ProfileImg = urlOf(1);
    this.coverPhoto = urlOf(2);
  }

  // ---------------------------------------------------------------- images

  removeImage(category: SycAttachmentCategoryDto) {
    const index = this.memberDto.entityAttachments.findIndex(x => x.attachmentCategoryId == category.id);
    if (index > -1) this.memberDto.entityAttachments.splice(index, 1);

    if (category.id === this.sycAttachmentCategoryLogo?.id) this.ProfileImg = undefined;
    else this.coverPhoto = undefined;
  }

  imageBrowseDone($event: ImageUploadComponentOutput, category: SycAttachmentCategoryDto) {
    const guid = this.guid();
    const index = this.memberDto.entityAttachments.findIndex(x => x.attachmentCategoryId == category.id);
    const att = index > -1 ? this.memberDto.entityAttachments[index] : new AppEntityAttachmentDto();

    att.fileName = $event.file.name;
    att.attachmentCategoryId = category.id;
    att.guid = guid;

    if (category.id === this.sycAttachmentCategoryLogo.id) this.ProfileImg = $event.image;
    else if (category.id === this.sycAttachmentCategoryBanner.id) this.coverPhoto = $event.image;

    if (index == -1) this.memberDto.entityAttachments.push(att);

    this.uploader.onBuildItemForm = (fileItem: any, form: any) => form.append('guid', guid);
    this.uploader.addToQueue([$event.file]);
    this.uploader.uploadAll();
  }

  // ---------------------------------------------------------------- save

  async SaveMember() {
    if (this.uploader.isUploading) {
      return this.notify.error(this.l('PleaseWait,SomeAttachmentsAreStillUploading'));
    }

    if (this.isManualOrExternalContact) this.setDefaultPublicFieldsToTrue();

    this.showMainSpinner();

    if (!this.memberDto.code) {
      const sequence = await this._sycIdentifierDefinitionsServiceProxy.getNextEntityCode(this.entityObjectType, null).toPromise();
      this.memberDto.code = 'C' + sequence;
    }

    this.memberDto.useDTOTenant = true;
    this.memberDto.name = this.getStringValue(701) + ' ' + this.getStringValue(702);

    // send only the allowed fields (UI-only fields such as extraDataAttributes are not copied)
    const allowedKeys = [
      'fileToken', 'tradeName', 'accountType', 'accountTypeId', 'ssin', 'priceLevel', 'notes', 'website', 'name', 'code',
      'phone1Number', 'phone1Ex', 'phone2Number', 'phone2Ex', 'phone3Number', 'phone3Ex', 'eMailAddress',
      'phone1TypeId', 'phone2TypeId', 'phone3TypeId', 'currencyId', 'languageId', 'entityId', 'tenantId',
      'attachmentSourceTenantId', 'useDTOTenant', 'returnId', 'accountLevel', 'entityCategories', 'entityClassifications',
      'entityAttachments', 'branches', 'contactAddresses', 'contactPaymentMethods', 'entityExtraData', 'id', 'parentId', 'accountId'
    ];
    const cleanDto = new CreateOrEditAccountInfoDto();
    for (const key of allowedKeys) (cleanDto as any)[key] = (this.memberDto as any)[key];

    cleanDto.entityExtraData = (cleanDto.entityExtraData || []).map(d => {
      const dto = new AppEntityExtraDataDto();
      dto.attributeId = d.attributeId;
      dto.attributeValue = d.attributeValue ?? undefined;
      dto.attributeValueId = d.attributeValueId ?? undefined;
      return dto;
    });

    // Relationship settings (job title / join date / branch -> parentId)
    applyRelationChanges(cleanDto, this.relationChanges, this.relationEntityObjectTypeId);

    this._AccountsServiceProxy.createOrUpdateContact(cleanDto)
      .pipe(finalize(() => this.hideMainSpinner()))
      .subscribe(result => {
        const userId = this.memberDto?.userId || result.userId;
        const memberId = this.memberDto?.id || result.id;

        if (this.appSession?.user?.memberId == this.memberDto?.id) {
          const profileImage = this.memberDto?.entityAttachments?.find(
            x => x.attachmentCategoryId === this.sycAttachmentCategoryLogo.id
          );
          if (profileImage?.guid) this.updateLogoService.updateProfilePicture();
        }

        this.createOrEditDone.emit({ userId, memberId });
      });
  }

  setDefaultPublicFieldsToTrue() {
    const m = this.memberDto;
    this.setBooleanValue(710, !!(m.phone1Number || m.phone1Ex || m.phone1TypeId));
    this.setBooleanValue(711, !!(m.phone2Number || m.phone2Ex || m.phone2TypeId));
    this.setBooleanValue(712, !!(m.phone3Number || m.phone3Ex || m.phone3TypeId));
    this.setBooleanValue(713, !!m.joinDate);
    this.setBooleanValue(708, !!(m.languageId || m.languageName));
    this.setBooleanValue(709, !!m.eMailAddress);
  }

  // ---------------------------------------------------------------- phones

  AddPhoneToList() {
    this.phonelist.push({});
  }

  removePhoneFromList(i: number) {
    this.phonelist.splice(i, 1);
    const n = i + 1;
    for (const suffix of ['Ex', 'IsPublic', 'CountryKey', 'Number', 'TypeId', 'TypeName']) {
      this.memberDto[`phone${n}${suffix}`] = undefined;
    }
  }

  onPhoneTypeChange($event: { value: number, originalEvent }, i: number) {
    this.memberDto[`phone${i + 1}TypeName`] = $event?.originalEvent?.target?.innerText;
  }

  telInputObjectphoneNumber(obj, i: number) {
    const key = `phone${i + 1}CountryKey`;
    if (!this.memberDto[key]) {
      this.memberDto[key] = 'us';
      obj.setCountry('us');
    }
  }

  onCountryChangephoneNumber(e, i: number) {
    this.memberDto[`phone${i + 1}CountryKey`] = e.iso2;
  }

  // ---------------------------------------------------------------- extra attribute helpers

  /** Last selected value from extraDataAttributes, falling back to entityExtraData. */
  private getExtraValue(attrId: number): string {
    const selected = this.memberDto?.extraDataAttributes?.find(a => a.extraAttributeId === attrId)?.selectedValues;
    const value = selected?.length ? selected[selected.length - 1].value : undefined;
    if (value != null && value !== '') return value.toString();
    return this.memberDto?.entityExtraData?.find(d => d.attributeId === attrId)?.attributeValue ?? '';
  }

  /** Keeps the UI copy (extraDataAttributes) and the payload copy (entityExtraData) in sync. */
  private setExtraValue(attrId: number, value: string): void {
    if (!this.memberDto.extraDataAttributes) this.memberDto.extraDataAttributes = [];

    let attr = this.memberDto.extraDataAttributes.find(a => a.extraAttributeId === attrId) as any;
    if (!attr) {
      attr = { extraAttributeId: attrId, selectedValues: [] };
      this.memberDto.extraDataAttributes.push(attr);
    }
    if (!attr.selectedValues?.length) {
      attr.selectedValues = [{ value, init() {}, toJSON() {} }];
    } else {
      attr.selectedValues[attr.selectedValues.length - 1].value = value;
    }

    if (!this.memberDto.entityExtraData) this.memberDto.entityExtraData = [];
    let row = this.memberDto.entityExtraData.find(d => d.attributeId === attrId);
    if (!row) {
      row = new AppEntityExtraDataDto();
      row.attributeId = attrId;
      this.memberDto.entityExtraData.push(row);
    }
    row.attributeValue = value;
    row.attributeValueId = undefined as any;
  }

  getStringValue(attrId: number): string {
    return this.getExtraValue(attrId);
  }

  setStringValue(attrId: number, val: string): void {
    this.setExtraValue(attrId, val);
  }

  getBooleanValue(attrId: number): boolean {
    return this.getExtraValue(attrId).toLowerCase() === 'true';
  }

  setBooleanValue(attrId: number, checked: boolean): void {
    this.setExtraValue(attrId, checked.toString());
  }

  // ---------------------------------------------------------------- relationship settings

  loadRelationAttributes(): void {
    this._sycEntityObjectTypesServiceProxy
      .getAllWithExtraAttributesByCode(RELATION_DEFINITION_CODE, RELATION_ENTITY_TYPE)
      .subscribe(result => {
        const { entityObjectTypeId, attributes } = extractRelationAttributes(result);
        this.relationEntityObjectTypeId = entityObjectTypeId;
        this.relationAttributes = attributes;
        this.prepareRelationInputs();
      });
  }

private prepareRelationInputs(): void {
    const branchId =
        this.memberDto?.parentId ??
        this.getStringValue(718);

    const { relationInputsDto, relationAttributeObject } =
        buildRelationInputs(
            this.relationAttributes,
            id => {
                if (id === RELATION_ATTR.BRANCH) {
                    return branchId != null
                        ? String(branchId)
                        : '';
                }

                return this.getStringValue(id);
            }
        );

    this.relationInputsDto = relationInputsDto;
    this.relationAttributeObject = relationAttributeObject;
}

  onRelationSettingsChanged(changes: any[]): void {
    collectRelationChanges(this.relationChanges, changes);
  }

  onRelationSettingCleared(attributeId: number): void {
    clearRelationChange(this.relationChanges, attributeId);
  }
}