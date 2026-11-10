import { Component, Injector, OnInit } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import {
  AccountsServiceProxy,
  SliderEnum,
  SydObjectsServiceProxy,
} from "@shared/service-proxies/service-proxies";
import { SectionType, ApiRow, SectionConfig, SectionItem } from "../../models/landingPage-types";
import { Router } from "@node_modules/@angular/router";
import Swal from 'sweetalert2';



interface FourBlocksGroup {
  type: 'FOUR_BLOCKS_GROUP';
  order: number;
  sections: SectionItem[];
}

type LandingRenderItem = SectionItem | FourBlocksGroup;


@Component({
  selector: "app-marketplace-landing-page",
  templateUrl: "./marketplace-landing-page.component.html",
  styleUrls: ["./marketplace-landing-page.component.scss"],
})
export class MarketplaceLandingPageComponent
  extends AppComponentBase
  implements OnInit {

  advSliderItems: string[] = [];
  items: any[] = [];
  pages: any[][] = [];

  sections: any
  sectionsFlat: SectionItem[] = [];

  loginTenaneSsin: string
  defaultUrl: string

  menuSections: SectionItem[] = [];

  isAuthenticated: boolean = false;

  
renderSections: LandingRenderItem[] = [];

fourBlocksResponsiveOptions = [
  {
    breakpoint: '1199px',
    numVisible: 2,
    numScroll: 1
  },
  {
    breakpoint: '767px',
    numVisible: 1,
    numScroll: 1
  }
];


  constructor(
    injector: Injector,
    private _sydObjectsAppService: SydObjectsServiceProxy,
    private _AccountsServiceProxy: AccountsServiceProxy, private router: Router,

  ) {
    super(injector);
    this.redirectTo();

  }

  ngOnInit(): void {
    this.isAuthenticated = !!this.appSession?.user;
    this.getLoginAccountDataForView()
    localStorage.removeItem("productFilters");
    localStorage.removeItem("marketplaceAccountsBrowseState");

    this.addLocal()
    this.pages = this.chunk(this.items, 9); // each page has 9 products
    this.loadSections()
  }


  private loadSections() {
    const sub = this._sydObjectsAppService
      .getAllSliderSettings(SliderEnum.CSSB, undefined)
      .subscribe((api: any) => {
        const rows: ApiRow[] = Array.isArray(api?.result) ? api.result : api;

        const normalized = rows.map((r, idx) => ({
          ...r,
          _type: this.TYPE_TO_SECTION[r.type] ?? 'ASSB',
          _order: r.order ?? 0,
          _idx: idx,
        }));

        const flat: SectionItem[] = normalized.map(r => {
          switch (r._type) {
            case 'ASSB':
              return {
                type: 'ASSB',
                order: r._order,
                sectionId: r.id,
                inputs: {
                  images: r.image ? [r.image] : [], // one row = one slide set (single image)
                  title: r.title ?? null, name: r.name ?? null, titleAlignment: r.titleAlignment
                },
                blockTypeIsSingleOrMixed: r.blockTypeIsSingleOrMixed
              };
            case 'ASMB':
              return {
                type: 'ASMB',
                order: r._order,
                sectionId: r.id,
                inputs: { images: r.image ? [r.image] : [], title: r.title ?? null, name: r.name ?? null, titleAlignment: r.titleAlignment },
                blockTypeIsSingleOrMixed: r.blockTypeIsSingleOrMixed

              };
            case 'CSMP':
              return {
                type: 'CSMP',
                order: r._order,
                sectionId: r.id,
                inputs: { title: r.title ?? null, name: r.name ?? null, titleAlignment: r.titleAlignment },
                blockTypeIsSingleOrMixed: r.blockTypeIsSingleOrMixed

              };

            case 'SRCTA':
              return {
                type: 'SRCTA',
                order: r._order,
                sectionId: r.id,
                inputs: { title: r.title, name: r.name ?? null, titleAlignment: r.titleAlignment },
                blockTypeIsSingleOrMixed: r.blockTypeIsSingleOrMixed
              };

            case 'MRCTA':
              return {
                type: 'MRCTA',
                order: r._order,
                sectionId: r.id,
                inputs: { title: r.title ?? null, name: r.name ?? null, titleAlignment: r.titleAlignment },
                blockTypeIsSingleOrMixed: r.blockTypeIsSingleOrMixed

              };


            case 'Menu':
              return {
                type: 'Menu',
                order: r._order,
                sectionId: r.id,
                inputs: {
                  title: r.title,
                  backgroundColor: r.backgroundColor,
                  textColor: r.textColor
                }
              };


            case 'IASCTA':
              return {
                type: 'IASCTA',
                order: r._order,
                sectionId: r.id,
                inputs: {
                  title: r.title,
                  firstImageLarger: r.firstImageLarger ?? true
                }
              };

            case 'FBS':
              return {
                type: 'FBS',
                order: r._order,
                sectionId: r.id,
                blockTypeIsSingleOrMixed: r.blockTypeIsSingleOrMixed,
                inputs: {
                  title: r.title,
                  titleAlignment: r.titleAlignment
                }
              };

            default:
              return {
                type: 'PF',
                order: r._order,
                sectionId: r.id,
                inputs: { images: r.image ? [r.image] : [], name: r.name ?? null, titleAlignment: r.titleAlignment }
              };
          }
        });

        flat.sort((a, b) => (a.order - b.order) || (rows.findIndex(rr => rr.id === a.sectionId) - rows.findIndex(rr => rr.id === b.sectionId)));

        this.sectionsFlat = flat;

        this.menuSections = flat.filter(
          section => section.type.toLocaleUpperCase() === 'MENU'
        );

        this.renderSections = this.buildRenderSections(flat);
        console.log(
  'FBS Groups:',
  this.renderSections.filter(
    item => item.type === 'FOUR_BLOCKS_GROUP'
  )
);
      });


  }


  private TYPE_TO_SECTION: Record<number, SectionType> = {

    0: 'ASSB',
    1: 'ASMB',
    2: 'ASSB',
    3: 'CSMP',
    4: 'SRCTA',
    5: 'MRCTA',
    6: 'PF',
    7: 'SM',
    8: 'Menu',
    9: 'IASCTA',
    10: 'FBS',


  };

  get sectionsSorted(): SectionConfig[] {

    return [...(this.sections || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }




  private chunk<T>(arr: T[] | undefined | null, size: number): T[][] {
    const array = arr || [];
    const out: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      out.push(array.slice(i, i + size));
    }
    return out;
  }

  addLocal() {
    localStorage.setItem("fromSellerRoom", JSON.stringify(false));
    localStorage.setItem("fromMarketPlace", JSON.stringify(true));
    localStorage.removeItem("productFilters");
  }


  getLoginAccountDataForView() {
    let id = this.appSession?.user?.accountId
    if (!id) return

    this._AccountsServiceProxy.getAccountForView(id, 5).pipe(

    ).subscribe((res) => {
      this.loginTenaneSsin = res?.account?.ssin
    })

  }

  async redirectTo() {

    if (this.appSession.tenantId && !this.appSession.user.accountId)
      await this.askForCompleteProfile();
  }

  async askForCompleteProfile() {

    Swal.fire({
      title: "",
      text: "Please Complete Your Profile Information",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "Later",
      confirmButtonText: "Proceed",
      allowOutsideClick: false,
      customClass: {
        popup: 'popup-class',
        icon: 'icon-class',
        content: 'content-class',
        actions: 'actions-class',
        confirmButton: 'confirm-button-class2'
      }
    }).then((result) => {
      if (result.isConfirmed)
        this.router.navigate(['/app/main/account'])
    });
  }

private buildRenderSections(
  sections: SectionItem[]
): LandingRenderItem[] {

  const result: LandingRenderItem[] = [];

  // Collect all FBS sections, sorted by order
  const fbsSections = sections
    .filter(section => section.type === 'FBS')
    .sort((a, b) => a.order - b.order);

  let fbsGroupAdded = false;

  for (const section of sections) {

    // Menu is rendered separately
    if (section.type === 'Menu') {
      continue;
    }

    if (section.type === 'FBS') {

      // Insert one carousel containing all FBS sections
      if (!fbsGroupAdded) {
        result.push({
          type: 'FOUR_BLOCKS_GROUP',
          order: section.order,
          sections: fbsSections
        });

        fbsGroupAdded = true;
      }

      continue;
    }

    // Other sections remain unchanged
    result.push(section);
  }

  return result;
}
getFourBlocksSections(
  item: LandingRenderItem
): SectionItem[] {

  return item.type === 'FOUR_BLOCKS_GROUP'
    ? item.sections
    : [];

}


  ngOnDestroy() {
    this.unsubscribeToAllSubscriptions();
  }

}
