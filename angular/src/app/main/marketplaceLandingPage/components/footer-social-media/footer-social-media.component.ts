import { Component, Injector, Input } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { PageSettingDto, SydObjectsServiceProxy } from "@shared/service-proxies/service-proxies";



@Component({
  selector: "app-footer-social-media",
  templateUrl: "./footer-social-media.component.html",
  styleUrls: ["./footer-social-media.component.scss"],
})
export class FooterSocialMediaComponent extends AppComponentBase {
  links: any[] = [];
  @Input() sectionId: number;
  @Input() sectionData: any;

  constructor(private SydObjectsServiceProxy: SydObjectsServiceProxy, injector: Injector,) {
    super(injector);

  }

  ngOnInit() {
    if (this.sectionId) {
      this.getBlocksData()

    }
  }

  getBlocksData() {
    this.SydObjectsServiceProxy
      .getAllSectionBlocks(
        this.sectionId, Intl.DateTimeFormat().resolvedOptions().timeZone
      )
      .subscribe((res) => {
        this.links = res

      });
  }

  private compareByOrder = (a: PageSettingDto, b: PageSettingDto) => {
    const ao = Number.isFinite(a.order as any) ? (a.order as number) : Number.MAX_SAFE_INTEGER;
    const bo = Number.isFinite(b.order as any) ? (b.order as number) : Number.MAX_SAFE_INTEGER;
    return (ao - bo) || ((a.id ?? 0) - (b.id ?? 0));
  };

  get blocksSorted(): PageSettingDto[] {
    return (this.links ?? []).slice().sort(this.compareByOrder);
  }

  openTab(link: any) {
    window.open(link)
  }
}
