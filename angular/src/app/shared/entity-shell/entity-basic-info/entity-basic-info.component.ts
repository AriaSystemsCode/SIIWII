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
import { SycAttachmentCategoryDto } from '@shared/service-proxies/service-proxies';
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
export class EntityBasicInfoComponent implements OnChanges, OnDestroy {

  // ---------- Inputs ----------
  @Input() entity: any;
  @Input() entityData: any;
  @Input() mode: EntityMode = 'view';
  @Input() fields: EntityBasicInfoField[] = [];
  @Input() entityTypes: any[] = [];
  @Input() statuses: any[] = [];
  @Input() fieldPermissions: Record<string, boolean> = {};

  @Input() showMedia = true;
  @Input() showAdditionalImages = true;
  @Input() saving = false;
  @Input() uploading = false;
  @Input() canDetele = false;

  @Input() logoAttachmentCategory: SycAttachmentCategoryDto;
  @Input() bannerAttachmentCategory: SycAttachmentCategoryDto;
  @Input() imageAttachmentCategory: SycAttachmentCategoryDto;

  @Input() attachmentsPath = 'account.entityAttachments';
  @Input() logoPath = 'account.logoUrl';
  @Input() coverPath = 'account.coverUrl';
  @Input() imagesPath = 'account.imagesUrls';

  @Input() bannerWidth = 1050;
  @Input() bannerHeight = 180;
  @Input() logoWidth = 100;
  @Input() logoHeight = 100;
  @Input() additionalImageWidth = 150;
  @Input() additionalImageHeight = 150;

  // ---------- Outputs ----------
  @Output() entityChange = new EventEmitter<any>();
  @Output() logoChange = new EventEmitter<EntityImageUploadEvent>();
  @Output() backgroundChange = new EventEmitter<EntityImageUploadEvent>();
  @Output() imageChange = new EventEmitter<EntityImageUploadEvent>();
  @Output() attachmentRemove = new EventEmitter<EntityImageRemoveEvent>();
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  // ---------- State ----------
  readonly additionalImagesCount = 4;

  logoPreviewUrl: string | null = null;
  coverPreviewUrl: string | null = null;
  additionalImageSlots: EntityImageSlot[] = this.createEmptySlots();
  logoUploaderVisible = true;

  private logoFile: File | null = null;
  private coverFile: File | null = null;
  private logoExistingAttachment: any = null;
  private bannerExistingAttachment: any = null;
  private readonly attachmentBaseUrl = AppConsts.attachmentBaseUrl;

  private readonly reloadImagesOn = [
    'entityData', 'attachmentsPath', 'logoPath', 'coverPath', 'imagesPath',
    'logoAttachmentCategory', 'bannerAttachmentCategory', 'imageAttachmentCategory'
  ];

  // ================= Lifecycle =================

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.entityData) {
      this.clearLocalImages();
    }
    if (this.reloadImagesOn.some(key => changes[key])) {
      this.loadExistingImages();
    }
  }

  ngOnDestroy(): void {
    this.clearLocalImages();
  }

  // ================= Getters =================

  /** True while the user is creating or editing (images can be changed). */
  get isEditing(): boolean {
    return this.mode === 'create' || this.mode === 'edit';
  }

  get busy(): boolean {
    return this.saving || this.uploading;
  }

  /** In view mode only slots that have an image are shown. */
  get visibleImageSlots(): EntityImageSlot[] {
    return this.mode === 'view'
      ? this.additionalImageSlots.filter(slot => !!slot.previewUrl)
      : this.additionalImageSlots;
  }

  // ================= Field values =================

  getValue(path: string): any {
    if (!path || !this.entityData) {
      return null;
    }
    return path.split('.').reduce((value, key) => value?.[key], this.entityData);
  }

  setValue(path: string, value: any): void {
    if (this.mode === 'view' || !this.entityData) {
      return;
    }
    this.setByPath(path, value);
    this.entityChange.emit(this.entityData);
  }

  /** Sets a nested value (creating objects on the way) without emitting. */
  private setByPath(path: string, value: any): void {
    if (!path || !this.entityData) {
      return;
    }

    const keys = path.split('.');
    const lastKey = keys.pop();
    if (!lastKey) {
      return;
    }

    let target = this.entityData;
    for (const key of keys) {
      target[key] = target[key] ?? {};
      target = target[key];
    }
    target[lastKey] = value;
  }

  isFieldVisible(field: EntityBasicInfoField): boolean {
    return !(
      (this.mode === 'create' && field.hiddenInCreate) ||
      (this.mode === 'edit' && field.hiddenInEdit) ||
      (this.mode === 'view' && field.hiddenInView)
    );
  }

  isFieldDisabled(field: EntityBasicInfoField): boolean {
    if (this.mode === 'view' || field.readonly || this.fieldPermissions[field.key] === false) {
      return true;
    }
    if (this.mode === 'create') {
      return field.key === 'ssin';
    }
    if (this.mode === 'edit') {
      return field.key === 'code' || field.key === 'ssin';
    }
    return true;
  }

  // ================= Action buttons =================

  onEdit(): void {
    if (!this.busy) {
      this.edit.emit();
    }
  }

  onDelete(): void {
    this.delete.emit();
  }

  onSave(): void {
    if (this.mode !== 'view' && !this.busy) {
      this.save.emit();
    }
  }

  onCancel(): void {
    if (!this.busy) {
      this.cancel.emit();
    }
  }

  // ================= Image selected =================

  onLogoSelected(event: ImageUploadComponentOutput): void {
    if (!event?.file) {
      return;
    }

    const previewUrl = event.image || URL.createObjectURL(event.file);
    this.logoFile = event.file;
    this.logoPreviewUrl = previewUrl;

    // Re-create the uploader so it resets after each selection.
    this.logoUploaderVisible = false;
    setTimeout(() => (this.logoUploaderVisible = true));

    this.logoChange.emit({
      file: event.file,
      previewUrl,
      attachmentType: 'LOGO',
      existingAttachment: this.logoExistingAttachment
    });
  }

  onBannerSelected(event: ImageUploadComponentOutput): void {
    this.coverFile = event.file;
    this.coverPreviewUrl = event.image;

    this.backgroundChange.emit({
      file: event.file,
      previewUrl: event.image,
      attachmentType: 'BANNER',
      existingAttachment: this.bannerExistingAttachment
    });
  }

  onAdditionalImageSelected(event: ImageUploadComponentOutput, index: number): void {
    if (!event?.file || !this.isValidSlotIndex(index)) {
      return;
    }

    const currentSlot = this.additionalImageSlots[index];
    this.additionalImageSlots[index] = {
      previewUrl: event.image,
      file: event.file,
      attachment: currentSlot?.attachment ?? null
    };
    this.additionalImageSlots = [...this.additionalImageSlots];

    this.imageChange.emit({
      file: event.file,
      previewUrl: event.image,
      attachmentType: 'IMAGE',
      index,
      existingAttachment: currentSlot?.attachment
    });
  }

  // ================= Image removed =================

  removeLogo(): void {
    const attachment = this.logoExistingAttachment;

    this.logoPreviewUrl = null;
    this.logoFile = null;
    this.logoExistingAttachment = null;
    this.setByPath(this.logoPath, null);

    this.attachmentRemove.emit({ attachmentType: 'LOGO', attachment });
  }

  removeBanner(): void {
    const attachment = this.bannerExistingAttachment;

    this.coverPreviewUrl = null;
    this.coverFile = null;
    this.bannerExistingAttachment = null;
    this.setByPath(this.coverPath, null);

    this.attachmentRemove.emit({ attachmentType: 'BANNER', attachment });
  }

  removeAdditionalImage(index: number): void {
    if (!this.isValidSlotIndex(index)) {
      return;
    }

    const slot = this.additionalImageSlots[index];
    this.additionalImageSlots[index] = { previewUrl: null, file: null, attachment: null };
    this.additionalImageSlots = [...this.additionalImageSlots];

    this.attachmentRemove.emit({
      attachmentType: 'IMAGE',
      index,
      attachment: slot?.attachment
    });
  }

  // ================= Load / clear images =================

  /** Releases blob URLs and resets all local image state. */
  clearLocalImages(): void {
    this.revokeBlob(this.logoPreviewUrl);
    this.revokeBlob(this.coverPreviewUrl);
    this.additionalImageSlots?.forEach(slot => this.revokeBlob(slot?.previewUrl));

    this.logoPreviewUrl = null;
    this.coverPreviewUrl = null;
    this.logoFile = null;
    this.coverFile = null;
    this.logoExistingAttachment = null;
    this.bannerExistingAttachment = null;
    this.additionalImageSlots = this.createEmptySlots();
  }

  private loadExistingImages(): void {
    const attachments = this.getAttachments();

    if (!this.logoFile && !this.logoPreviewUrl) {
      this.logoExistingAttachment =
        this.findByCategory(attachments, this.logoAttachmentCategory?.id);
      this.logoPreviewUrl =
        this.attachmentUrl(this.logoExistingAttachment) ||
        this.buildUrl(this.getValue(this.logoPath));
    }

    if (!this.coverFile && !this.coverPreviewUrl) {
      this.bannerExistingAttachment =
        this.findByCategory(attachments, this.bannerAttachmentCategory?.id);
      this.coverPreviewUrl =
        this.attachmentUrl(this.bannerExistingAttachment) ||
        this.buildUrl(this.getValue(this.coverPath));
    }

    this.loadAdditionalImages(attachments);
  }

  private loadAdditionalImages(attachments: any[]): void {
    const imageAttachments = attachments
      .filter(a => this.isCategory(a, this.imageAttachmentCategory?.id))
      .slice(0, this.additionalImagesCount);

    const directPaths = this.getValue(this.imagesPath);
    const directImages: string[] = Array.isArray(directPaths) ? directPaths : [];

    this.additionalImageSlots = this.additionalImageSlots.map((currentSlot, index) => {
      // Keep images the user just selected.
      if (currentSlot?.file) {
        return currentSlot;
      }

      const attachment = imageAttachments[index];
      return {
        previewUrl: this.attachmentUrl(attachment) || this.buildUrl(directImages[index]),
        file: null,
        attachment: attachment ?? null
      };
    });
  }

  // ================= Helpers =================

  private getAttachments(): any[] {
    const attachments = this.getValue(this.attachmentsPath);
    return Array.isArray(attachments) ? attachments : [];
  }

  private isCategory(attachment: any, categoryId: number): boolean {
    return !!attachment && !!categoryId &&
      Number(attachment.attachmentCategoryId) === Number(categoryId);
  }

  private findByCategory(attachments: any[], categoryId: number): any {
    return attachments.find(a => this.isCategory(a, categoryId)) ?? null;
  }

  private attachmentUrl(attachment: any): string | null {
    if (!attachment) {
      return null;
    }
    return this.buildUrl(
      attachment.url || attachment.fileUrl || attachment.filePath || attachment.fileName
    );
  }

  /** Returns a full URL. Absolute, blob and data URLs are kept as they are. */
  private buildUrl(path: string | null | undefined): string | null {
    const trimmed = typeof path === 'string' ? path.trim() : '';
    if (!trimmed) {
      return null;
    }

    if (/^(https?:\/\/|blob:|data:)/.test(trimmed)) {
      return trimmed;
    }

    const baseUrl = this.attachmentBaseUrl?.replace(/\/$/, '') || '';
    const cleanPath = trimmed.replace(/^\/+/, '');
    return baseUrl ? `${baseUrl}/${cleanPath}` : cleanPath;
  }

  private createEmptySlots(): EntityImageSlot[] {
    return Array.from({ length: this.additionalImagesCount }, () => ({
      previewUrl: null,
      file: null,
      attachment: null
    }));
  }

  private isValidSlotIndex(index: number): boolean {
    return index >= 0 && index < this.additionalImagesCount;
  }

  private revokeBlob(url: string | null | undefined): void {
    if (url?.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }
}