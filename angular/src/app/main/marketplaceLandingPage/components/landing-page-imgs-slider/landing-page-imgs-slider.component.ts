
import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  HostListener
} from '@angular/core';

import { SydObjectsServiceProxy } from
  '@shared/service-proxies/service-proxies';

import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs';

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

  attachmentBaseUrl = AppConsts.attachmentBaseUrl;
  

  constructor(
    private syd: SydObjectsServiceProxy
  ) {}

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

  @HostListener('window:resize')
  onResize(): void {
    this.updateScreenSize();
    this.updateVisibleImages();
  }

  updateScreenSize(): void {
    this.isMobile = window.innerWidth <= 767;
  }

  loadImages(): void {
    if (!this.sectionId) return;

    this.loading = true;

    this.syd.getAllSectionBlocks(
      this.sectionId,
      Intl.DateTimeFormat().resolvedOptions().timeZone
    )
    .pipe(
      finalize(() => this.loading = false)
    )
    .subscribe({
      next: (res: any) => {
        const blocks = Array.isArray(res)
          ? res
          : Array.isArray(res?.result)
            ? res.result
            : Array.isArray(res?.items)
              ? res.items
              : [];

        this.images = blocks
          .filter((x: any) => !!x.image)
          .sort(
            (a: any, b: any) =>
              (a.order ?? 0) - (b.order ?? 0)
          );

        this.currentIndex = 0;
        this.updateVisibleImages();
      },
      error: (err) => {
        console.error('Failed to load images:', err);
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

  if (width <= 575) {
    count = 2;
  } else if (width <= 991) {
    count = 3;
  }

  this.visibleImages = Array.from(
    { length: Math.min(count, this.images.length) },
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
    this.currentIndex = index;
    this.updateVisibleImages();
  }

  getImageUrl(item: any): string {
    const path = item?.image || '';

    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    return `${this.attachmentBaseUrl.replace(/\/$/, '')}/${path.replace(/^\/+/, '')}`;
  }

 
openImage(item: any): void {
  const url =
    item?.externalUrl ||
    item?.link ||
    item?.linkPageUrl;

  if (!url) return;

  let finalUrl: string;

  if (/^https?:\/\//i.test(url)) {
    // External URL
    finalUrl = url;
  } else if (url.startsWith('/')) {
    // Internal page URL
    finalUrl = `${window.location.origin}${url}`;
  } else if (url.startsWith('attachments/')) {
    // Attachment or PDF
    finalUrl =
      `${this.attachmentBaseUrl.replace(/\/$/, '')}/${url}`;
  } else {
    // Relative internal page URL
    finalUrl = new URL(url, window.location.origin + '/').href;
  }

  // Always open in a new tab
  window.open(finalUrl, '_blank', 'noopener,noreferrer');
}


  trackByImage(index: number, item: any): number {
    return item.id ?? index;
  }
}
