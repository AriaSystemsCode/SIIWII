import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PageSettingDto } from '@shared/service-proxies/service-proxies';
import { LandingPageBlocksService } from '../../services/landing-page-blocks.service';
import { AppConsts } from '@shared/AppConsts';

@Component({
  selector: 'app-landing-page-block-card',
  templateUrl: './landing-page-block-card.component.html',
  styleUrls: ['./landing-page-block-card.component.scss'],
})
export class LandingPageBlockCardComponent {
  @Input() item: PageSettingDto;
  @Input() compact = true;
  @Input() blockTypeIsSingleOrMixed: string;
  @Input() loginTenaneSsin: string;

  @Output() eventDetails = new EventEmitter<number>();
  /** Emits getAccountForViewDto so the parent can open the profile / connect flow. */
  @Output() contactDetails = new EventEmitter<any>();

  readonly placeholder = 'assets/placeholders/_logo-placeholder.png';
  readonly pdfIcon = 'assets/Items/pdf-Icon.png';

  attachmentBaseUrl = AppConsts.attachmentBaseUrl;

  constructor(private blocksService: LandingPageBlocksService) {}

  get blockType(): string {
    return (this.item?.blockType || '').toUpperCase();
  }

  // ---------- name ----------
  get blockName(): string {
    const b = this.item;

    switch (this.blockType) {
      case 'PRODUCT':
        return b?.getAppMarketItemForViewDto?.appItem?.name || b?.name || '';
      case 'CONTACT':
        return b?.getAccountForViewDto?.account?.name || b?.name || '';
      case 'EVENT':
        return b?.getAppEventForViewDto?.appEvent?.name || b?.name || '';
      case 'BRAND':
        return b?.getAppEntityForViewDto?.appEntity?.name || b?.name || '';
      case 'CATEGORY':
        return b?.getSycEntityObjectCategoryForViewDto?.sycEntityObjectCategory?.name || b?.name || '';
      default:
        return b?.title || b?.name || '';
    }
  }

  // ---------- image ----------

private url(path?: string): string {
  if (!path) return this.placeholder;

  if (
    /^(https?:)?\/\//i.test(path) ||
    path.startsWith('assets/') ||
    path.startsWith('data:')
  ) {
    return path;
  }

  return this.blocksService.fullUrl(path);
}



get blockImage(): string {
  const b = this.item;
  if (!b) return this.placeholder;

  const validImage = (path?: string | null): string | null => {
    return path && !this.blocksService.isDocFile(path)
      ? this.url(path)
      : null;
  };

  switch (this.blockType) {

    case 'PRODUCT':
      return validImage(
        b.getAppMarketItemForViewDto?.appItem?.imageUrl
      ) || validImage(b.image) || this.placeholder;

    case 'EVENT': {
      const event = b.getAppEventForViewDto?.appEvent;

      return validImage(event?.logoURL)
        || validImage(event?.banarURL)
        || validImage(b.image)
        || this.placeholder;
    }

    case 'CONTACT': {
      const account = b.getAccountForViewDto?.account;

      return validImage(account?.logoUrl)
        || validImage(account?.coverUrl)
        || validImage(account?.imagesUrls?.[0])
        || this.placeholder;
    }

    case 'BRAND':
    case 'CATEGORY':
      return validImage(b.image)
        || this.getEntityAttachmentImage(b)
        || this.placeholder;

    case 'ATTACHMENT': {
      const image = this.blocksService.getAttachmentImage(b);

      if (image) return this.url(image);

      return this.blocksService.hasAttachmentFile(b)
        ? this.blocksService.getAttachmentFileIcon(b)
        : this.placeholder;
    }

    default:
      return validImage(b.image)
        || this.getEntityAttachmentImage(b)
        || this.placeholder;
  }
}

private getEntityAttachmentImage(b: PageSettingDto): string | null {
  const attachments = [
    ...(b.entityAttachments || []),
    ...(b.getAppEntityForViewDto?.appEntity?.entityAttachments || [])
  ];

  const image = attachments.find(a =>
    this.blocksService.isImg(a?.url || a?.fileName)
  );

  return image
    ? this.url(image.url || image.fileName)
    : null;
}

  get blockIcon(): string {
    return this.blocksService.getBlockTypeIcon(this.item);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.onerror = null;
    img.src = this.placeholder;
  }

  // ---------- click ----------
    openBlock(): void {
    const b = this.item;
    if (!b) return;

    switch (this.blockType) {
      case 'PRODUCT': {
        const product = b.getAppMarketItemForViewDto;
        if (product?.appItem?.id) this.blocksService.viewProduct(product);
        break;
      }

      case 'CATEGORY': {
        const id = b.getSycEntityObjectCategoryForViewDto?.sycEntityObjectCategory?.id;
        if (id) this.blocksService.goToCategory(id);
        break;
      }

      case 'BRAND':
        if (b.getAppEntityForViewDto?.appEntity?.id) this.blocksService.goToBrand(b);
        break;

      case 'EVENT': {
        const id = b.getAppEventForViewDto?.appEvent?.id;
        if (id) this.eventDetails.emit(id);
        break;
      }

      case 'CONTACT':
        if (b.getAccountForViewDto) this.contactDetails.emit(b.getAccountForViewDto);
        break;

      case 'ATTACHMENT':
        this.blocksService.onAttachmentClick(b);
        break;

      // No blockType: open its link in a new tab,
      // otherwise open its PDF if it has one, otherwise do nothing
      default:
        if (!this.blocksService.openBlockLink(b) && this.blocksService.hasPdfAttachment(b)) {
          this.blocksService.onAttachmentClick(b);
        }
        break;
    }
  }
}