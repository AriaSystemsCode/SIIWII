import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PageSettingDto } from '@shared/service-proxies/service-proxies';
import { LandingPageBlocksService } from '../../services/landing-page-blocks.service';

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
    return path ? this.blocksService.fullUrl(path) : this.placeholder;
  }

  get blockImage(): string {
    const b = this.item;
    if (!b) return this.placeholder;

    // ATTACHMENT: image preview (block.image or first image in entityAttachments),
    // PDF icon if only a PDF exists
    // if (this.blockType === 'ATTACHMENT') {
    //   const img = this.blocksService.getAttachmentImage(b);
    //   if (img) return img;
    //   return this.blocksService.hasPdfAttachment(b) ? this.pdfIcon : this.placeholder;
    // }

    // // Other types: block.image unless it is a PDF
    // if (b.image && !this.blocksService.isPdf(b.image)) return this.url(b.image);
        if (this.blockType === 'ATTACHMENT') {
      const img = this.blocksService.getAttachmentImage(b);
      if (img) return img;
      return this.blocksService.hasAttachmentFile(b)
        ? this.blocksService.getAttachmentFileIcon(b)
        : this.placeholder;
    }

    // Other types: block.image unless it is a PDF/Excel file
    if (b.image && !this.blocksService.isDocFile(b.image)) return this.url(b.image);

    // image inside entityAttachments
    const imgAtt = b.entityAttachments?.find(a =>
      this.blocksService.isImg(a?.url || a?.fileName)
    );
    if (imgAtt) return this.url(imgAtt.url || imgAtt.fileName);

    // brand: entity attachments
    const entityAtt = b.getAppEntityForViewDto?.appEntity?.entityAttachments;
    if (entityAtt?.length) return this.url(entityAtt[0].url || entityAtt[0].fileName);

    return this.placeholder;
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