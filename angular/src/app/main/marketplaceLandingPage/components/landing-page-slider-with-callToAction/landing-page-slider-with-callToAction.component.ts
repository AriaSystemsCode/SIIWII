import { Component, Injector, Input, OnInit } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { PageSettingDto, SycAttachmentCategoryDto, SydObjectsServiceProxy } from "@shared/service-proxies/service-proxies";
import { AppConsts } from "@shared/AppConsts";
import { finalize } from 'rxjs';

@Component({
  selector: "app-slider-with-callToAction",
  templateUrl: "./landing-page-slider-with-callToAction.component.html",
  styleUrls: ["./landing-page-slider-with-callToAction.component.scss"],
})
export class LandingPageSliderWithCallToActionComponent extends AppComponentBase implements OnInit {
  sliderItems: PageSettingDto[] = [];
  @Input() sectionId: number;

  interval = 10000;
  numVisible = 1;
  numScroll = 1;

  sycAttachmentCategoryAutoSlider: SycAttachmentCategoryDto;
  attachmentBaseUrl = AppConsts.attachmentBaseUrl;
    loading = false;
hasLoadError = false;
  constructor(injector: Injector, private SydObjectsServiceProxy: SydObjectsServiceProxy) {
    super(injector);
  }

  ngOnInit() {
    this.getSycAttachmentCategoriesByCodes(["AUTOSLIDER"]).subscribe((res) => {
      this.sycAttachmentCategoryAutoSlider = res[0];
    });

    if (this.sectionId) this.getBlocksData();
  }

  private compareByOrder = (a: PageSettingDto, b: PageSettingDto) => {
    const ao = Number.isFinite(a.order as any) ? (a.order as number) : Number.MAX_SAFE_INTEGER;
    const bo = Number.isFinite(b.order as any) ? (b.order as number) : Number.MAX_SAFE_INTEGER;
    return (ao - bo) || ((a.id ?? 0) - (b.id ?? 0));
  };

  get blocksSorted(): PageSettingDto[] {
    return (this.sliderItems ?? []).slice().sort(this.compareByOrder);
  }

  getBlocksData() {
      this.loading = true;
  this.hasLoadError = false;

    this.SydObjectsServiceProxy.getAllSectionBlocks(this.sectionId,Intl.DateTimeFormat().resolvedOptions().timeZone).pipe(
          finalize(() => {
            this.loading = false;
          })
        )
        .subscribe({
      next: (res) => {
        this.sliderItems = res ?? [];
      },
      error: () => {
        this.sliderItems = [];
        this.hasLoadError = true;
      }
    });
    //     .subscribe((res) => {
    //   this.sliderItems = (res ?? []) as any;
    // });
  }

  getSlideImage(slide: any): string {
    const direct = slide?.image ? `${this.attachmentBaseUrl}/${slide.image}` : null;
    if (direct) return direct;

    const imgAtt = (slide?.entityAttachments ?? []).find((x: any) => this.isImageUrl(x?.url || x?.fileName));
    if (imgAtt?.url) return `${this.attachmentBaseUrl}/${imgAtt.url}`;

    return "../../../../assets/placeholders/_logo-placeholder.png";
  }

  onSlideClick(slide: any, ev?: MouseEvent): void {
    ev?.preventDefault();
    ev?.stopPropagation();

    const pdfUrl = this.getPdfUrl(slide);
    const fallback = slide?.link || slide?.linkPageUrl;

    const urlToOpen = pdfUrl || fallback;
    if (!urlToOpen) return;

    window.open(urlToOpen, "_blank", "noopener");
  }

  private getPdfUrl(slide: any): string | null {
    const pdfAtt = (slide?.entityAttachments ?? []).find((x: any) => this.isPdfUrl(x?.url || x?.fileName));
    const rel = pdfAtt?.url || pdfAtt?.fileName;
    return rel ? `${this.attachmentBaseUrl}/${rel}` : null;
  }

  private isPdfUrl(path?: string): boolean {
    return !!path && /\.pdf(\?|#|$)/i.test(path);
  }

  private isImageUrl(path?: string): boolean {
    return !!path && /\.(png|jpe?g|gif|webp|bmp|svg)(\?|#|$)/i.test(path);
  }
}
