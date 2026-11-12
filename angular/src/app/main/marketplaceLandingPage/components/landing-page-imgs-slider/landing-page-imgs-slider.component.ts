import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  HostListener
} from '@angular/core';

import {
  SydObjectsServiceProxy
} from '@shared/service-proxies/service-proxies';

import { finalize } from 'rxjs';

import {
  LandingPageBlocksService
} from '../../services/landing-page-blocks.service';

@Component({
  selector: 'app-landing-page-imgs-slider',
  templateUrl: './landing-page-imgs-slider.component.html',
  styleUrls: ['./landing-page-imgs-slider.component.scss']
})
export class LandingPageImgsSliderComponent
  implements OnInit, OnChanges {

  @Input() sectionId: number;
  @Input() firstImageLarger = true;

  images: any[] = [];
  visibleImages: any[] = [];

  loading = false;
  currentIndex = 0;
  isMobile = false;

  constructor(
    private syd: SydObjectsServiceProxy,
    private blocksService: LandingPageBlocksService
  ) {}

  // ========================================
  // INITIALIZATION
  // ========================================

  ngOnInit(): void {
    this.updateScreenSize();
    this.loadImages();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.sectionId &&
      !changes.sectionId.firstChange
    ) {
      this.currentIndex = 0;
      this.loadImages();
    }
  }

  // ========================================
  // RESPONSIVE
  // ========================================

  @HostListener('window:resize')
  onResize(): void {
    this.updateScreenSize();
    this.updateVisibleImages();
  }

  updateScreenSize(): void {
    this.isMobile = window.innerWidth <= 767;
  }

  // ========================================
  // LOAD SECTION BLOCKS
  // ========================================

  loadImages(): void {
    if (!this.sectionId) return;

    this.loading = true;

    this.syd.getAllSectionBlocks(
      this.sectionId,
      Intl.DateTimeFormat().resolvedOptions().timeZone
    )
    .pipe(
      finalize(() => {
        this.loading = false;
      })
    )
    .subscribe({
      next: (res: any) => {

        const blocks: any[] = Array.isArray(res)
          ? res
          : Array.isArray(res?.result)
            ? res.result
            : Array.isArray(res?.items)
              ? res.items
              : [];

        this.images = blocks
          .map((block: any) => {

            // Find image thumbnail from block.image
            // or entityAttachments.
            const previewImage =
              this.blocksService.getAttachmentImage(block);

            // Find PDF / Excel attachment.
            // Also checks block.image if it is a file.
            const attachmentUrl =
              this.blocksService.getAttachmentFileUrl(block);

            // If a PDF has no image thumbnail,
            // display its PDF placeholder.
            const fallbackImage = attachmentUrl
              ? this.blocksService.getAttachmentFileIcon(block)
              : null;

            return {
              ...block,

              previewImage:
                previewImage || fallbackImage,

              attachmentUrl
            };
          })
          .filter((block: any) => !!block.previewImage)
          .sort(
            (a: any, b: any) =>
              (a.order ?? 0) - (b.order ?? 0)
          );

        this.currentIndex = 0;
        this.updateVisibleImages();

      },

      error: (err) => {
        console.error(
          'Failed to load slider images:',
          err
        );

        this.images = [];
        this.visibleImages = [];
      }
    });
  }



  updateVisibleImages(): void {
    if (!this.images.length) {
      this.visibleImages = [];
      return;
    }

    const width = window.innerWidth;

    let count = 4;

    // Mobile
    if (width <= 575) {
      count = 2;
    }
    // Tablet
    else if (width <= 991) {
      count = 3;
    }

    const visibleCount = Math.min(
      count,
      this.images.length
    );

    this.visibleImages = Array.from(
      { length: visibleCount },
      (_, i) =>
        this.images[
          (this.currentIndex + i) % this.images.length
        ]
    );
  }

  next(): void {
    if (this.images.length <= 1) return;

    this.currentIndex =
      (this.currentIndex + 1) % this.images.length;

    this.updateVisibleImages();
  }

  previous(): void {
    if (this.images.length <= 1) return;

    this.currentIndex =
      (this.currentIndex - 1 + this.images.length)
      % this.images.length;

    this.updateVisibleImages();
  }

  goTo(index: number): void {
    if (
      index < 0 ||
      index >= this.images.length
    ) {
      return;
    }

    this.currentIndex = index;
    this.updateVisibleImages();
  }



  getImageUrl(item: any): string {
    return item?.previewImage ||
      'assets/placeholders/_logo-placeholder.png';
  }

  openImage(item: any): void {
    if (!item) return;

    if (item.attachmentUrl) {
      window.open(
        item.attachmentUrl,
        '_blank',
        'noopener,noreferrer'
      );
      return;
    }

    // 2. Open configured link in new tab.
    const link =
      item.externalUrl ||
      item.link ||
      item.linkPageUrl;

    if (!link) return;

    let finalUrl: string;

    if (/^https?:\/\//i.test(link)) {
      finalUrl = link;
    } else if (
      link.startsWith('attachments/')
    ) {
      finalUrl = this.blocksService.fullUrl(link);
    } else {
      finalUrl = new URL(
        link,
        window.location.origin + '/'
      ).href;
    }

    window.open(
      finalUrl,
      '_blank',
      'noopener,noreferrer'
    );
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;

    img.onerror = null;
    img.src =
      'assets/placeholders/_logo-placeholder.png';
  }
  trackByImage(index: number, item: any): number {
    return item?.id ?? index;
  }
}
