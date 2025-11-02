import { Component, OnInit } from "@angular/core";
import { SliderEnum, SydObjectsServiceProxy } from "@shared/service-proxies/service-proxies";
import { SectionItem, SectionType } from "../../models/landingPage-types";

@Component({
    selector: "app-landing-page-footer",
    templateUrl: "./landing-page-footer.component.html",
    styleUrls: ["./landing-page-footer.component.scss"],
})
export class landingPageFooterComponent implements OnInit {
    brands:any
          // update these numbers from API as needed
          sections:any
          sectionsFlat: SectionItem[] = [];   // what ngFor iterates
    constructor(      private _sydObjectsAppService: SydObjectsServiceProxy,) {
        // this.brands = [
        //     { name: 'Apple',        img: 'assets/placeholders/_logo-placeholder.png' },
        //     { name: 'Samsung',      img: 'assets/placeholders/_logo-placeholder.png' },
        //     { name: 'Nike',         img: 'assets/placeholders/_logo-placeholder.png' },
        //     { name: 'Adidas',       img: 'assets/placeholders/_logo-placeholder.png' },
        //     { name: 'Sony',         img: 'assets/placeholders/_logo-placeholder.png' },
        //     { name: 'LG',           img: 'assets/placeholders/_logo-placeholder.png' },
        //     { name: 'Microsoft',    img: 'assets/placeholders/_logo-placeholder.png' },
        //     { name: 'Huawei',       img: 'assets/placeholders/_logo-placeholder.png' },
        //     { name: 'Xiaomi',       img: 'assets/brands/xiaomi.svg' },
        //     { name: 'Lenovo',       img: 'assets/brands/lenovo.svg' },
        //   ];
    }

    ngOnInit(): void {
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
              _type:this.TYPE_TO_SECTION[r.type]  ?? 'ASSB',
              _order: r.order ?? 0,
              _idx: idx, // preserve API order for stable tiebreaks
            }));
    
            // Convert every row into a SectionItem the template can render
            const flat: SectionItem[] = normalized.map((r: any) => {
              switch (r._type) {
                case 'PF':
                  // Expecting inputs like: links array or brands, etc.
                  // You can shape this however your PageLinkFooter needs it.
                  return {
                    type: 'PF',
                    order: r._order,
                    sectionId: r.id,
                    inputs: {
                      title: r.title ?? null,
                      name: r.name ?? null,
                      links: r.items ?? r.links ?? [], // adjust to your BE
                    },
                  };
                case 'SM':
                  // Social media: pass links array (or empty → component can fallback)
                  return {
                    type: 'SM',
                    order: r._order,
                    sectionId: r.id,
                    inputs: {
                      links: r.items ?? r.links ?? [],  title: r.title ?? null,
                      name: r.name ?? null,// [{name,url,iconSrc}] or BE shape you map inside component
                    },
                  };
                default:
                  // Ignore or map other types if needed
                  return {
                    type: 'ASSBPF',
                    order: r._order,
                    sectionId: r.id,
                    inputs: {},
                  };
              }
            });
    
            // Stable sort by (order, original idx)
            flat.sort((a, b) => (a.order - b.order) ||
              (normalized.findIndex((x: any) => x.id === a.sectionId) - normalized.findIndex((x: any) => x.id === b.sectionId))
            );
    
            // Keep only the footer-relevant types
            this.sectionsFlat = flat.filter(s => s.type === 'PF' || s.type === 'SM');
            console.log(this.sectionsFlat,'foooterS')
          });
      }
    
      trackBySection = (_: number, s: SectionItem) => s.sectionId;

}
