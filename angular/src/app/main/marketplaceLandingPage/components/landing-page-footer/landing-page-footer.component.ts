import { Component, Injector, OnInit } from "@angular/core";
import { AppEntitiesServiceProxy, SliderEnum, SydObjectsServiceProxy } from "@shared/service-proxies/service-proxies";
import { SectionItem, SectionType } from "../../models/landingPage-types";
import { AppComponentBase } from "@shared/common/app-component-base";

@Component({
  selector: "app-landing-page-footer",
  templateUrl: "./landing-page-footer.component.html",
  styleUrls: ["./landing-page-footer.component.scss"],
})
export class landingPageFooterComponent extends AppComponentBase implements OnInit {
  brands: any
  tenantLogo: string
  sections: any
  sectionsFlat: SectionItem[] = [];
  bgCol: string
  tenantName: string
  currentLang: string = 'en';
    isArabic: boolean = false;
  constructor(private _sydObjectsAppService: SydObjectsServiceProxy, private _appEntitiesServiceProxy: AppEntitiesServiceProxy, injector: Injector,) {
    super(injector);
  }

  ngOnInit(): void {
    this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName')
    this.currentLang == 'ar' || this.currentLang == 'ar-EG'  ? this.isArabic = true : this.isArabic = false
    this.getTenantData()
    this.loadSections()
  }
  private TYPE_TO_SECTION: Record<number, SectionType> = {
    0: 'ASSB',
    1: 'ASMB',
    2: 'ASSB',
    3: 'CSMP',
    4: 'SRCTA',
    5: 'MRCTA',
    6: 'PF',     // Page links (brands / quick links)
    7: 'SM',     // Social media
  };
  private loadSections() {
    this._sydObjectsAppService.getAllSliderSettings(SliderEnum.CSSB, undefined)
      .subscribe((api: any) => {
        const rows = Array.isArray(api?.result) ? api.result : api;

        const normalized = rows.map((r: any, idx: number) => ({
          ...r,
          _type: this.TYPE_TO_SECTION[r.type] ?? 'ASSB',
          _order: r.order ?? 0,
          _idx: idx, // preserve API order for stable tiebreaks
        }));

        // Convert every row into a SectionItem the template can render
        const flat: SectionItem[] = normalized.map((r: any) => {
          switch (r._type) {
            case 'PF':
              return {
                type: 'PF',
                order: r._order,
                sectionId: r.id,
                inputs: {
                  title: r.title ?? null,
                  name: r.name ?? null,
                  links: r.items ?? r.links ?? [],
                },
              };
            case 'SM':

              return {
                type: 'SM',
                order: r._order,
                sectionId: r.id,
                inputs: {
                  links: r.items ?? r.links ?? [], title: r.title ?? null,
                  name: r.name ?? null,
                },
              };
            default:

              return {
                type: 'ASSBPF',
                order: r._order,
                sectionId: r.id,
                inputs: {},
              };
          }
        });


        flat.sort((a, b) => (a.order - b.order) ||
          (normalized.findIndex((x: any) => x.id === a.sectionId) - normalized.findIndex((x: any) => x.id === b.sectionId))
        );

        this.sectionsFlat = flat.filter(s => s.type === 'PF' || s.type === 'SM');

      });
  }

  trackBySection = (_: number, s: SectionItem) => s.sectionId;



  getTenantData() {


    this._appEntitiesServiceProxy.getHostSettingValue(1206, "file")
      .subscribe((result) => {
        this.tenantLogo = result
      });

    this._appEntitiesServiceProxy.getHostSettingValue(1208, null)
      .subscribe((result) => {
       this.bgCol = result 

      });
    this._appEntitiesServiceProxy.getHostSettingValue(1205, null)
      .subscribe((result) => {
        this.tenantName = result
      });
  }

}
