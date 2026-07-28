import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { AppConsts } from '@shared/AppConsts';
import { EntityBasicInfoField } from '../models/generic-entity.model';

interface EntityAttachmentImage {
  id?: number;
  url: string;
  fileName?: string;
  original?: any;
}

@Component({
  selector: 'app-entity-basic-info',
  templateUrl: './entity-basic-info.component.html',
  styleUrls: ['./entity-basic-info.component.scss']
})
export class EntityBasicInfoComponent {

  @Input() entityData: any;
  @Input() entity: any;

  @Input() mode: 'create' | 'edit' | 'view' = 'view';

  @Input() entityTypes: any[] = [];
  @Input() statuses: any[] = [];
  @Input() fields: EntityBasicInfoField[] = [];

 
  @Input() logoPath = 'account.logoUrl';
  @Input() coverPath = 'account.coverUrl';
  @Input() imagesPath = 'account.imagesUrls';

  /*
   * Optional fallback when images are returned as entity attachments.
   */
  @Input() attachmentsPath = 'account.entityAttachments';

  @Output() entityChange = new EventEmitter<any>();

  @Output() imageChange = new EventEmitter<{
    files: File[];
    type: 'attachments';
  }>();

  @Output() backgroundChange = new EventEmitter<{
    file: File;
    previewUrl: string;
    type: 'cover';
  }>();

  @Output() logoChange = new EventEmitter<{
    file: File;
    previewUrl: string;
    type: 'logo';
  }>();

  @Output() attachmentRemove = new EventEmitter<{
    attachment: any;
    index: number;
  }>();

  attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;

  private logoPreviewUrl: string;
  private coverPreviewUrl: string;
  private attachmentPreviews: EntityAttachmentImage[] = [];

  getValue(path: string): any {
    if (!path || !this.entityData) {
      return null;
    }

    return path
      .split('.')
      .reduce((obj, key) => obj?.[key], this.entityData);
  }

  setValue(path: string, value: any): void {
    if (!path || !this.entityData) {
      return;
    }

    const keys = path.split('.');
    const lastKey = keys.pop();

    if (!lastKey) {
      return;
    }

    const target = keys.reduce((obj, key) => {
      obj[key] = obj[key] || {};
      return obj[key];
    }, this.entityData);

    target[lastKey] = value;

    this.entityChange.emit(this.entityData);
  }

  get logoImageUrl(): string {
    if (this.logoPreviewUrl) {
      return this.logoPreviewUrl;
    }

    return this.buildAttachmentUrl(
      this.getValue(this.logoPath)
    );
  }

  get coverImageUrl(): string {
    if (this.coverPreviewUrl) {
      return this.coverPreviewUrl;
    }

    return this.buildAttachmentUrl(
      this.getValue(this.coverPath)
    );
  }

  get attachmentImages(): EntityAttachmentImage[] {
    const imagesFromUrlArray = this.getImagesFromUrlArray();

    const imagesFromAttachments = this.getImagesFromAttachments();

    return [
      ...imagesFromUrlArray,
      ...imagesFromAttachments,
      ...this.attachmentPreviews
    ];
  }

  private getImagesFromUrlArray(): EntityAttachmentImage[] {
    const images = this.getValue(this.imagesPath);

    if (!Array.isArray(images)) {
      return [];
    }

    return images
      .map((image, index) => {
        const rawUrl =
          typeof image === 'string'
            ? image
            : image?.url || image?.imageUrl || image?.fileName;

        return {
          id: image?.id,
          url: this.buildAttachmentUrl(rawUrl),
          fileName: image?.fileName || `image-${index + 1}`,
          original: image
        };
      })
      .filter(image => !!image.url);
  }

  private getImagesFromAttachments(): EntityAttachmentImage[] {
    const attachments = this.getValue(this.attachmentsPath);

    if (!Array.isArray(attachments)) {
      return [];
    }

    return attachments
      .filter(attachment => this.isImageAttachment(attachment))
      .map(attachment => ({
        id: attachment?.id,
        url: this.buildAttachmentUrl(
          attachment?.url ||
          attachment?.fileUrl ||
          attachment?.fileName
        ),
        fileName: attachment?.fileName,
        original: attachment
      }))
      .filter(image => !!image.url);
  }

  private buildAttachmentUrl(path: string): string {
    if (!path) {
      return '';
    }

    if (
      path.startsWith('http://') ||
      path.startsWith('https://') ||
      path.startsWith('data:') ||
      path.startsWith('blob:')
    ) {
      return path;
    }

    const baseUrl = this.attachmentBaseUrl?.replace(/\/$/, '');
    const cleanPath = path.replace(/^\//, '');

    return `${baseUrl}/${cleanPath}`;
  }

  private isImageAttachment(attachment: any): boolean {
    const fileName =
      attachment?.fileName ||
      attachment?.url ||
      attachment?.fileUrl ||
      '';

    return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileName);
  }

  onBackgroundSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.coverPreviewUrl = URL.createObjectURL(file);

    this.backgroundChange.emit({
      file,
      previewUrl: this.coverPreviewUrl,
      type: 'cover'
    });

    input.value = '';
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.logoPreviewUrl = URL.createObjectURL(file);

    this.logoChange.emit({
      file,
      previewUrl: this.logoPreviewUrl,
      type: 'logo'
    });

    input.value = '';
  }

  onAttachmentsSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);

    if (!files.length) {
      return;
    }

    const validImages = files.filter(file =>
      file.type.startsWith('image/')
    );

    const previews = validImages.map(file => ({
      url: URL.createObjectURL(file),
      fileName: file.name,
      original: file
    }));

    this.attachmentPreviews = [
      ...this.attachmentPreviews,
      ...previews
    ];

    this.imageChange.emit({
      files: validImages,
      type: 'attachments'
    });

    input.value = '';
  }

  removeAttachment(
    attachment: EntityAttachmentImage,
    index: number
  ): void {

    if (attachment.original instanceof File) {
      this.attachmentPreviews =
        this.attachmentPreviews.filter(
          item => item !== attachment
        );
    }

    this.attachmentRemove.emit({
      attachment: attachment.original ?? attachment,
      index
    });
  }

  onImageError(event: Event): void {
    const image = event.target as HTMLImageElement;

    image.style.display = 'none';
  }
}