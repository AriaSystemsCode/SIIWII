import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges
} from '@angular/core';

import { AppConsts } from '@shared/AppConsts';

import {
  SycAttachmentCategoryDto
} from '@shared/service-proxies/service-proxies';

import {
  EntityBasicInfoField,
  EntityImageRemoveEvent,
  EntityImageSlot,
  EntityImageUploadEvent,
  EntityMode,
  ImageUploadComponentOutput
} from '../models/generic-entity.model';


@Component({
  selector: 'app-entity-basic-info',
  templateUrl: './entity-basic-info.component.html',
  styleUrls: ['./entity-basic-info.component.scss']
})
export class EntityBasicInfoComponent
  implements OnChanges, OnDestroy {

 
  @Input()
fieldPermissions:
  Record<string, boolean> = {};
  @Input() entityData: any;

  @Input() entity: any;

  @Input()
  mode: EntityMode = 'view';
@Input()
requireAccountType = true;

  @Input()
showMedia = true;
  /*
   * Generic fields rendered at the top.
   */
  @Input()
  fields: EntityBasicInfoField[] = [];

  @Input()
  entityTypes: any[] = [];

  @Input()
  statuses: any[] = [];

  /*
   * Attachment categories are loaded once
   * in the parent and passed to this component.
   */
  @Input()
  logoAttachmentCategory:
    SycAttachmentCategoryDto;

  @Input()
  bannerAttachmentCategory:
    SycAttachmentCategoryDto;

  @Input()
  imageAttachmentCategory:
    SycAttachmentCategoryDto;

  /*
   * Generic paths.
   */
  @Input()
  attachmentsPath =
    'account.entityAttachments';

  @Input()
  logoPath =
    'account.logoUrl';

  @Input()
  coverPath =
    'account.coverUrl';

  /*
   * Paths used for Basic Info validation.
   */
  @Input()
  namePath =
    'account.name';

  @Input()
  accountTypePath =
    'account.accountTypeId';

  /*
   * Loading states controlled by parent.
   */
  @Input()
  saving = false;

  @Input()
  uploading = false;

  /*
   * Upload box dimensions.
   */
  @Input()
  bannerWidth = 1050;

  @Input()
  bannerHeight = 180;

  @Input()
  logoWidth = 100;

  @Input()
  logoHeight = 100;

  @Input()
  additionalImageWidth = 105;

  @Input()
  additionalImageHeight = 105;

  /*
   * Output when normal fields change.
   */
  @Output()
  entityChange =
    new EventEmitter<any>();

  /*
   * Upload events.
   */
  @Output()
  logoChange =
    new EventEmitter<EntityImageUploadEvent>();

  @Output()
  backgroundChange =
    new EventEmitter<EntityImageUploadEvent>();

  @Output()
  imageChange =
    new EventEmitter<EntityImageUploadEvent>();

  @Output()
  attachmentRemove =
    new EventEmitter<EntityImageRemoveEvent>();

  /*
   * Action events.
   */
  @Output()
  edit =
    new EventEmitter<void>();

  @Output()
  save =
    new EventEmitter<void>();

  @Output()
  cancel =
    new EventEmitter<void>();

  readonly additionalImagesCount = 4;

  logoPreviewUrl: string | null = null;

  coverPreviewUrl: string | null = null;

  logoFile: File | null = null;

  coverFile: File | null = null;

  logoExistingAttachment: any = null;

  bannerExistingAttachment: any = null;

  additionalImageSlots:
    EntityImageSlot[] =
      this.createEmptyImageSlots();

  attachmentBaseUrl =
    AppConsts.attachmentBaseUrl;

    logoUploaderVisible = true;


    @Input()
imagesPath = 'account.imagesUrls';

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    const shouldInitialize =
       changes.entityData ||
  changes.attachmentsPath ||
  changes.logoPath ||
  changes.coverPath ||
  changes.imagesPath ||
  changes.logoAttachmentCategory ||
  changes.bannerAttachmentCategory ||
  changes.imageAttachmentCategory;

    if (shouldInitialize) {
      this.initializeExistingImages();
    }
  }

  /**
   * Reads a value from entityData using
   * a path such as account.name.
   */
  getValue(
    path: string
  ): any {

    if (
      !path ||
      !this.entityData
    ) {
      return null;
    }

    return path
      .split('.')
      .reduce(
        (
          currentObject,
          propertyName
        ) => {
          return currentObject?.[
            propertyName
          ];
        },
        this.entityData
      );
  }

  /**
   * Changes a value using a generic path.
   */
  setValue(
    path: string,
    value: any
  ): void {

    if (
      !path ||
      !this.entityData ||
      this.mode === 'view'
    ) {
      return;
    }

    const properties =
      path.split('.');

    const lastProperty =
      properties.pop();

    if (!lastProperty) {
      return;
    }

    const targetObject =
      properties.reduce(
        (
          currentObject,
          propertyName
        ) => {

          if (
            currentObject[
              propertyName
            ] === null ||
            currentObject[
              propertyName
            ] === undefined
          ) {
            currentObject[
              propertyName
            ] = {};
          }

          return currentObject[
            propertyName
          ];
        },
        this.entityData
      );

    targetObject[
      lastProperty
    ] = value;

    this.entityChange.emit(
      this.entityData
    );
  }


  /**
   * View mode -> Edit mode.
   */
  editClicked(): void {
    if (
      this.saving ||
      this.uploading
    ) {
      return;
    }

    this.edit.emit();
  }

  /**
   * Save button.
   */
  saveClicked(): void {
    if (
      this.mode === 'view' ||
      this.saving ||
      this.uploading ||
      !this.isBasicInfoValid
    ) {
      return;
    }

    this.save.emit();
  }

  /**
   * Cancel button.
   */
  cancelClicked(): void {
    if (
      this.saving ||
      this.uploading
    ) {
      return;
    }

    this.cancel.emit();
  }

  /**
   * Logo upload after crop is complete.
   */
onLogoBrowseDone(
  event: ImageUploadComponentOutput
): void {

  if (!event?.file) {
    return;
  }

  this.logoFile = event.file;

  const previewUrl =
    event.image ||
    URL.createObjectURL(
      event.file
    );

  /*
   * Recreate app-image-upload so it reads
   * the new [image] input.
   */
  this.logoUploaderVisible = false;

  this.logoPreviewUrl =
    previewUrl;

  setTimeout(() => {
    this.logoUploaderVisible = true;
  });

  this.logoChange.emit({
    file: event.file,
    previewUrl,
    attachmentType: 'LOGO',
    existingAttachment:
      this.logoExistingAttachment
  });
}
  /**
   * Banner upload after crop is complete.
   */
  onBannerBrowseDone(
    event:
      ImageUploadComponentOutput
  ): void {

    if (!event?.file) {
      return;
    }

    this.coverFile =
      event.file;

    this.coverPreviewUrl =
      event.image;

    this.backgroundChange.emit({
      file: event.file,
      previewUrl: event.image,
      attachmentType: 'BANNER',
      existingAttachment:
        this.bannerExistingAttachment
    });
  }

  /**
   * Additional image upload after crop.
   */
  onAdditionalImageBrowseDone(
    event:
      ImageUploadComponentOutput,
    index: number
  ): void {

    if (
      !event?.file ||
      index < 0 ||
      index >=
        this.additionalImagesCount
    ) {
      return;
    }

    const currentSlot =
      this.additionalImageSlots[
        index
      ];

    this.additionalImageSlots[
      index
    ] = {
      previewUrl:
        event.image,
      file:
        event.file,
      attachment:
        currentSlot
          ?.attachment ??
        null
    };

    /*
     * Create a new array reference
     * to ensure Angular updates
     * the child input.
     */
    this.additionalImageSlots = [
      ...this.additionalImageSlots
    ];

    this.imageChange.emit({
      file: event.file,
      previewUrl: event.image,
      attachmentType: 'IMAGE',
      index,
      existingAttachment:
        currentSlot?.attachment
    });
  }

  /**
   * Remove logo.
   */
  removeLogo(): void {
    const existingAttachment =
      this.logoExistingAttachment;

    this.logoPreviewUrl = null;
    this.logoFile = null;
    this.logoExistingAttachment =
      null;

    this.setPathWithoutEmit(
      this.logoPath,
      null
    );

    this.attachmentRemove.emit({
      attachmentType: 'LOGO',
      attachment:
        existingAttachment
    });
  }

  /**
   * Remove cover/banner.
   */
  removeBanner(): void {
    const existingAttachment =
      this.bannerExistingAttachment;

    this.coverPreviewUrl = null;
    this.coverFile = null;
    this.bannerExistingAttachment =
      null;

    this.setPathWithoutEmit(
      this.coverPath,
      null
    );

    this.attachmentRemove.emit({
      attachmentType: 'BANNER',
      attachment:
        existingAttachment
    });
  }

  /**
   * Remove one of the four images.
   */
  removeAdditionalImage(
    index: number
  ): void {

    if (
      index < 0 ||
      index >=
        this.additionalImagesCount
    ) {
      return;
    }

    const slot =
      this.additionalImageSlots[
        index
      ];

    this.additionalImageSlots[
      index
    ] = {
      previewUrl: null,
      file: null,
      attachment: null
    };

    this.additionalImageSlots = [
      ...this.additionalImageSlots
    ];

    this.attachmentRemove.emit({
      attachmentType: 'IMAGE',
      index,
      attachment:
        slot?.attachment
    });
  }

  /**
   * Loads existing logo, banner and images
   * when entering view/edit mode.
   */
  private initializeExistingImages():
    void {

    const attachments =
      this.getAttachments();

    /*
     * Do not overwrite a newly selected
     * local file while the user is editing.
     */
if (
  !this.logoFile &&
  !this.logoPreviewUrl
) {
  this.logoExistingAttachment =
    this.findAttachmentByCategory(
      attachments,
      this.logoAttachmentCategory?.id
    );

  this.logoPreviewUrl =
    this.getAttachmentUrl(
      this.logoExistingAttachment
    ) ||
    this.getDirectImagePath(
      this.logoPath
    );
}

    if (  !this.coverFile &&
  !this.coverPreviewUrl) {
      this.bannerExistingAttachment =
        this.findAttachmentByCategory(
          attachments,
          this.bannerAttachmentCategory
            ?.id
        );

      this.coverPreviewUrl =
        this.getAttachmentUrl(
          this.bannerExistingAttachment
        ) ||
        this.getDirectImagePath(
          this.coverPath
        );
    }

   const existingAttachmentImages =
  attachments
    .filter(
      attachment =>
        this.isCategoryMatch(
          attachment,
          this.imageAttachmentCategory?.id
        )
    )
    .slice(
      0,
      this.additionalImagesCount
    );

const directImagePaths =
  this.getValue(
    this.imagesPath
  );

const directImages: string[] =
  Array.isArray(directImagePaths)
    ? directImagePaths
    : [];

const newSlots =
  this.createEmptyImageSlots();

for (
  let index = 0;
  index < this.additionalImagesCount;
  index++
) {
  const currentSlot =
    this.additionalImageSlots[index];

  // Preserve newly selected local file.
  if (currentSlot?.file) {
    newSlots[index] =
      currentSlot;

    continue;
  }

  const attachment =
    existingAttachmentImages[index];

  const directPath =
    directImages[index];

  newSlots[index] = {
    previewUrl:
      this.getAttachmentUrl(
        attachment
      ) ||
      (
        directPath
          ? this.buildAttachmentUrl(
              directPath
            )
          : null
      ),

    file: null,

    attachment:
      attachment ?? null
  };
}

this.additionalImageSlots =
  newSlots;
  }

  private getAttachments():
    any[] {

    const attachments =
      this.getValue(
        this.attachmentsPath
      );

    return Array.isArray(
      attachments
    )
      ? attachments
      : [];
  }

  private findAttachmentByCategory(
    attachments: any[],
    categoryId: number
  ): any {

    if (!categoryId) {
      return null;
    }

    return attachments.find(
      attachment =>
        this.isCategoryMatch(
          attachment,
          categoryId
        )
    );
  }

  private isCategoryMatch(
    attachment: any,
    categoryId: number
  ): boolean {

    if (
      !attachment ||
      !categoryId
    ) {
      return false;
    }

    return Number(
      attachment
        .attachmentCategoryId
    ) === Number(categoryId);
  }

  private getAttachmentUrl(
    attachment: any
  ): string | null {

    if (!attachment) {
      return null;
    }

    const path =
      attachment.url ||
      attachment.fileUrl ||
      attachment.filePath ||
      attachment.fileName;

    return path
      ? this.buildAttachmentUrl(
          path
        )
      : null;
  }

  private getDirectImagePath(
    path: string
  ): string | null {

    const value =
      this.getValue(path);

    if (!value) {
      return null;
    }

    return this.buildAttachmentUrl(
      value
    );
  }

  private buildAttachmentUrl(
    path: string
  ): string {

    if (!path) {
      return '';
    }

    if (
      path.startsWith(
        'http://'
      ) ||
      path.startsWith(
        'https://'
      ) ||
      path.startsWith(
        'data:'
      ) ||
      path.startsWith(
        'blob:'
      )
    ) {
      return path;
    }

    const baseUrl =
      this.attachmentBaseUrl
        ?.replace(
          /\/$/,
          ''
        ) || '';

    const cleanPath =
      path.replace(
        /^\//,
        ''
      );

    return baseUrl
      ? `${baseUrl}/${cleanPath}`
      : cleanPath;
  }

  private createEmptyImageSlots():
    EntityImageSlot[] {

    return Array.from(
      {
        length:
          this.additionalImagesCount
      },
      () => ({
        previewUrl: null,
        file: null,
        attachment: null
      })
    );
  }

  /**
   * Sets a value without emitting another
   * field-change event.
   */
  private setPathWithoutEmit(
    path: string,
    value: any
  ): void {

    if (
      !path ||
      !this.entityData
    ) {
      return;
    }

    const properties =
      path.split('.');

    const lastProperty =
      properties.pop();

    if (!lastProperty) {
      return;
    }

    const targetObject =
      properties.reduce(
        (
          currentObject,
          propertyName
        ) => {

          if (
            currentObject[
              propertyName
            ] === null ||
            currentObject[
              propertyName
            ] === undefined
          ) {
            currentObject[
              propertyName
            ] = {};
          }

          return currentObject[
            propertyName
          ];
        },
        this.entityData
      );

    targetObject[
      lastProperty
    ] = value;
  }

  /**
   * Clears local upload state when closing
   * or destroying the modal.
   */
  clearLocalImages(): void {
    this.logoFile = null;
    this.coverFile = null;

    this.logoPreviewUrl = null;
    this.coverPreviewUrl = null;

    this.logoExistingAttachment =
      null;

    this.bannerExistingAttachment =
      null;

    this.additionalImageSlots =
      this.createEmptyImageSlots();
  }

  getVisibleAdditionalImages():
  EntityImageSlot[] {

  if (this.mode === 'view') {
    return this.additionalImageSlots.filter(
      slot => !!slot.previewUrl
    );
  }

  return this.additionalImageSlots;
}

isFieldVisible(
  field: EntityBasicInfoField
): boolean {

  if (
    this.mode === 'create' &&
    field.hiddenInCreate
  ) {
    return false;
  }

  if (
    this.mode === 'edit' &&
    field.hiddenInEdit
  ) {
    return false;
  }

  if (
    this.mode === 'view' &&
    field.hiddenInView
  ) {
    return false;
  }

  return true;
}



get account(): any {
  return this.entityData?.account ?? {};
}

get isManualAccount(): boolean {
  return this.account?.isManual === true;
}

get isConnectedAccount(): boolean {
  return this.account?.isConnected === true;
}

isFieldDisabled(
  field: EntityBasicInfoField
): boolean {

  if (this.mode === 'view') {
    return true;
  }

  if (field.readonly) {
    return true;
  }

  if (
    field.key in this.fieldPermissions &&
    this.fieldPermissions[field.key] === false
  ) {
    return true;
  }

  // Create: Code editable, SSIN remains readonly.
  if (this.mode === 'create') {
    return field.key === 'ssin';
  }

  // Connected account: no basic fields editable.
  if (
    this.mode === 'edit' &&
    this.isConnectedAccount
  ) {
    return true;
  }

  // Manual account: everything except Code and SSIN.
  if (
    this.mode === 'edit' &&
    this.isManualAccount
  ) {
    return (
      field.key === 'code' ||
      field.key === 'ssin'
    );
  }

  return true;
}

get canEditImages(): boolean {
  if (this.mode === 'create') {
    return true;
  }

  return (
    this.mode === 'edit' &&
    this.isManualAccount &&
    !this.isConnectedAccount
  );
}

get isBasicInfoValid(): boolean {
  const name =
    this.getValue(this.namePath);

  if (
    typeof name !== 'string' ||
    !name.trim()
  ) {
    return false;
  }

  if (!this.requireAccountType) {
    return true;
  }

  const accountTypeId =
    this.getValue(
      this.accountTypePath
    );

  return !!accountTypeId;
}
  ngOnDestroy(): void {
    this.clearLocalImages();
  }
}
