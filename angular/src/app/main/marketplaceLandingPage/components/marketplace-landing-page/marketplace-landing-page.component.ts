import { Component, Injector, OnInit } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import {
    AppMarketplaceItemsServiceProxy,
    PagedResultDtoOfGetAllMarketplaceItemListsOutputDto,
    SliderEnum,
    SycEntityObjectCategoriesServiceProxy,
    SydObjectsServiceProxy,
} from "@shared/service-proxies/service-proxies";

import { Router } from "@node_modules/@angular/router";
import { SectionType,ApiRow, SectionConfig, SectionItem } from "../../models/landingPage-types";



@Component({
    selector: "app-marketplace-landing-page",
    templateUrl: "./marketplace-landing-page.component.html",
    styleUrls: ["./marketplace-landing-page.component.scss"],
})
export class MarketplaceLandingPageComponent
    extends AppComponentBase
    implements OnInit
{



    // autoSliderCode: string = "SycLandingPageSettingsAutoSlider";
    // CTASliderCode: string = "SycLandingPageSettingsCTASlider";
    // advSliderCode: string = "SycLandingPageSettingsAdvSlider";
     advSliderItems: string[] = [];
     brands:any
     departments:any
     items:any
     productList:any
     pages: any[][] = [];

      // update these numbers from API as needed
      sections:any
      sectionsFlat: SectionItem[] = [];   // what ngFor iterates
    private fetchedBrands = false;

    constructor(
        injector: Injector,
        private _sydObjectsAppService: SydObjectsServiceProxy,
        private _appMarketplaceItemsServiceProxy: AppMarketplaceItemsServiceProxy,
        private router: Router,
        private _sycEntityObjectCategoriesServiceProxy: SycEntityObjectCategoriesServiceProxy,
    ) {
        super(injector);



          this.items = [
            {
                "appItem": {
                    "code": "00001094-000000000032",
                    "name": "    Flower Power Top",
                    "description": null,
                    "price": 0,
                    "published": false,
                    "listed": false,
                    "imageUrl": "attachments/-1/8119619d-52f4-2c36-a673-0d6989b37314.jpg",
                    "ssin": "00001094-000000000032",
                    "sharingLevel": null,
                    "showItem": true,
                    "sellerName": "Dresscode",
                    "manufacturerCode": "6004",
                    "id": 363498
                },
                "selected": false,
                "sellerSSIN": null,
                "numberOfReviews": 1,
                "averageRating": 5
            },
            {
                "appItem": {
                    "code": "00001130-000000000005",
                    "name": " \"Never Slow Down\" Printed Fashionable T-Shirt",
                    "description": null,
                    "price": 0,
                    "published": false,
                    "listed": false,
                    "imageUrl": "attachments/-1/cf04d0f0-0985-76cf-c24b-f13c812182a3.webp",
                    "ssin": "00001130-000000000005",
                    "sharingLevel": null,
                    "showItem": true,
                    "sellerName": "RAVIN",
                    "manufacturerCode": "RAV-7002",
                    "id": 364075
                },
                "selected": false,
                "sellerSSIN": "Business-000000000071",
                "numberOfReviews": 0,
                "averageRating": 0
            },
            {
                "appItem": {
                    "code": "00002244-000000000049",
                    "name": " Blazer",
                    "description": null,
                    "price": 0,
                    "published": false,
                    "listed": false,
                    "imageUrl": "attachments/-1/04141886-e609-a4fe-04ac-10a0c1112b04.PNG",
                    "ssin": "00002244-000000000049",
                    "sharingLevel": null,
                    "showItem": true,
                    "sellerName": "TORINO WEAR",
                    "manufacturerCode": "TOR-0114576205",
                    "id": 365691
                },
                "selected": false,
                "sellerSSIN": null,
                "numberOfReviews": 0,
                "averageRating": 0
            },
            {
                "appItem": {
                    "code": "00002305-000000000012",
                    "name": " Crew Neck Sweater",
                    "description": null,
                    "price": 0,
                    "published": false,
                    "listed": false,
                    "imageUrl": "attachments/-1/468330e9-4531-2ba2-cdd9-05348f4a64a9.PNG",
                    "ssin": "00002305-000000000012",
                    "sharingLevel": null,
                    "showItem": true,
                    "sellerName": "Nillens",
                    "manufacturerCode": "NLLS-9520215404",
                    "id": 367001
                },
                "selected": false,
                "sellerSSIN": null,
                "numberOfReviews": 0,
                "averageRating": 0
            },
            {
                "appItem": {
                    "code": "00001081-000000000015",
                    "name": " Essential Biker Short",
                    "description": null,
                    "price": 0,
                    "published": false,
                    "listed": false,
                    "imageUrl": "attachments/-1/0ef7ec3f-c781-ce7e-53c5-958487173e0a.webp",
                    "ssin": "00001081-000000000015",
                    "sharingLevel": null,
                    "showItem": true,
                    "sellerName": "Sigma Fit",
                    "manufacturerCode": "23235",
                    "id": 363240
                },
                "selected": false,
                "sellerSSIN": null,
                "numberOfReviews": 1,
                "averageRating": 4
            },
            {
                "appItem": {
                    "code": "00002352-000000000001",
                    "name": " Flamingo Tee",
                    "description": null,
                    "price": 0,
                    "published": false,
                    "listed": false,
                    "imageUrl": "attachments/-1/5326acc6-806a-6559-d33c-47400254e12b.PNG",
                    "ssin": "00002352-000000000001",
                    "sharingLevel": null,
                    "showItem": true,
                    "sellerName": "Vustra",
                    "manufacturerCode": "S/V5400001551",
                    "id": 367315
                },
                "selected": false,
                "sellerSSIN": null,
                "numberOfReviews": 0,
                "averageRating": 0
            },
            {
                "appItem": {
                    "code": "00002177-000000000012",
                    "name": " Front Printing Slip On Hoodie",
                    "description": null,
                    "price": 0,
                    "published": false,
                    "listed": false,
                    "imageUrl": "attachments/-1/d5e0328d-df49-49d6-76bc-32906ffeaff1.PNG",
                    "ssin": "00002177-000000000012",
                    "sharingLevel": null,
                    "showItem": true,
                    "sellerName": "Andora",
                    "manufacturerCode": "AN-6456582",
                    "id": 364563
                },
                "selected": false,
                "sellerSSIN": null,
                "numberOfReviews": 0,
                "averageRating": 0
            },
            {
                "appItem": {
                    "code": "00001020-000000000006",
                    "name": " Geometric Trees Embroidery Tunic",
                    "description": null,
                    "price": 0,
                    "published": false,
                    "listed": false,
                    "imageUrl": "attachments/-1/3969d748-86cc-6e7e-a4e7-3708d38f8ddb.jpg",
                    "ssin": "00001020-000000000006",
                    "sharingLevel": null,
                    "showItem": true,
                    "sellerName": "Nina Mclemore",
                    "manufacturerCode": "7928",
                    "id": 362693
                },
                "selected": false,
                "sellerSSIN": null,
                "numberOfReviews": 0,
                "averageRating": 0
            },
            {
                "appItem": {
                    "code": "00001130-000000000018",
                    "name": " Girls Polka Dots Buttoned Dress",
                    "description": null,
                    "price": 0,
                    "published": false,
                    "listed": false,
                    "imageUrl": "attachments/-1/76537a31-798b-2ed3-0c89-c0b747968194.webp",
                    "ssin": "00001130-000000000018",
                    "sharingLevel": null,
                    "showItem": true,
                    "sellerName": "RAVIN",
                    "manufacturerCode": null,
                    "id": 364088
                },
                "selected": false,
                "sellerSSIN": "Business-000000000071",
                "numberOfReviews": 0,
                "averageRating": 0
            },
            {
                "appItem": {
                    "code": "00001018-000000000001",
                    "name": "- Ladies Butterfly Floral Printed Mid-Length Basic Rain Coat with Removable Hood",
                    "description": null,
                    "price": 0,
                    "published": false,
                    "listed": false,
                    "imageUrl": "attachments/-1/1a7bf404-9e27-bdef-98e1-dac57ece6893.webp",
                    "ssin": "00001018-000000000001",
                    "sharingLevel": null,
                    "showItem": true,
                    "sellerName": "Capelli New York",
                    "manufacturerCode": "CNY-ST1",
                    "id": 362837
                },
                "selected": false,
                "sellerSSIN": null,
                "numberOfReviews": 0,
                "averageRating": 0
            },
            {
                "appItem": {
                    "code": "00002200-000000000001",
                    "name": " Mazzika  T-shirt",
                    "description": null,
                    "price": 0,
                    "published": false,
                    "listed": false,
                    "imageUrl": "attachments/-1/16f018c8-791c-2438-e185-3b816f0e4c49.webp",
                    "ssin": "00002200-000000000001",
                    "sharingLevel": null,
                    "showItem": true,
                    "sellerName": "NAS Trends",
                    "manufacturerCode": "NAS-4652101",
                    "id": 364972
                },
                "selected": false,
                "sellerSSIN": null,
                "numberOfReviews": 0,
                "averageRating": 0
            },
            {
                "appItem": {
                    "code": "00002215-000000000004",
                    "name": " MICROFIBER WATERPROOF PUFFER JACKET",
                    "description": null,
                    "price": 0,
                    "published": false,
                    "listed": false,
                    "imageUrl": "attachments/-1/fe923c7a-234d-3adb-98d5-c257cc26841a.jpg",
                    "ssin": "00002215-000000000004",
                    "sharingLevel": null,
                    "showItem": true,
                    "sellerName": "Junior Group Egypt",
                    "manufacturerCode": "JGE-451157102",
                    "id": 365144
                },
                "selected": false,
                "sellerSSIN": null,
                "numberOfReviews": 0,
                "averageRating": 0
            }
        ]
    }

    ngOnInit(): void {
        this.pages = this.chunk(this.items, 9); // each page has 9 products
        this.loadSections()
        // this.GetAllAtoSliderSettings();
        // this.loadSectionsFromBackend()
        // this.getAllCallToActionSettings();
        // this.getAdvSettings();
        // this.getAllBrands()
        // this.getParentDepartments()
        // this.getAllProductCAtalogs()
        // this.getAllBrandSettings()
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
            _idx: idx, // preserve API order
          }));
    
          const flat: SectionItem[] = normalized.map(r => {
            switch (r._type) {
              case 'ASSB':
                return {
                  type: 'ASSB',
                  order: r._order,
                  sectionId: r.id,
                  // rowIds: [r.id],
                  inputs: {
                    images: r.image ? [r.image] : [], // one row = one slide set (single image)
                    title: r.title ?? null , name: r.name ?? null
                  }
                };
              case 'ASMB':
                return {
                  type: 'ASMB',
                  order: r._order,
                  sectionId: r.id,
                  // rowIds: [r.id],
                  inputs: { images: r.image ? [r.image] : [] ,    title: r.title ?? null , name: r.name ?? null}
                };
              case 'CSMP':
                return {
                  type: 'CSMP',
                  order: r._order,
                  sectionId: r.id,
                  // rowIds: [r.id],
                  inputs: {  title: r.title ?? null, name: r.name ?? null} 
                };
              // case 'PF':
              //   // You can call getAllBrands() once globally if you like
              //   // or leave it as-is if brands are already cached
              //   return {
              //     type: 'PF',
              //     order: r._order,
              //     sectionId: r.id,
              //     // rowIds: [r.id],
              //     inputs: { title: r.title , name: r.name ?? null }
              //   };
              case 'SRCTA':
                return {
                  type: 'SRCTA',
                  order: r._order,
                  sectionId: r.id,
                  // rowIds: [r.id],
                  inputs: { title: r.title , name: r.name ?? null }
                };
              // case 'departments':
              //   return {
              //     type: 'departments',
              //     order: r._order,
              //     sectionId: r.id,
              //     // rowIds: [r.id],
              //     inputs: { title: r.title , name: r.name ?? null }
              //   };
              case 'MRCTA':
                return {
                  type: 'MRCTA',
                  order: r._order,
                  sectionId: r.id,
                  // rowIds: [r.id],
                  inputs: { title: r.title ?? null , name: r.name ?? null}
                };
              default:
                return {
                  type: 'PF',
                  order: r._order,
                  sectionId: r.id,
                  // rowIds: [r.id],
                  inputs: { images: r.image ? [r.image] : [] , name: r.name ?? null}
                };
            }
          });
    
          // Stable order: by order, then by original index
          flat.sort((a, b) => (a.order - b.order) || (rows.findIndex(rr => rr.id === a.sectionId) - rows.findIndex(rr => rr.id === b.sectionId)));
    
          this.sectionsFlat = flat;
    
          // fetch brands once if any PF exists
          if (flat.some(s => s.type === 'SRCTA') && !this.fetchedBrands) {
            this.fetchedBrands = true;
            this.getAllBrands();
          }
        });
    
 
      }    
    

    private TYPE_TO_SECTION: Record<number, SectionType> = {
   
        0: 'ASSB',
        1: 'ASMB',
        2: 'ASSB',
        3: 'CSMP',
        4: 'SRCTA',
        5: 'MRCTA',   
        6:'PF',
        7:'SM'   
    
      };
      
      get sectionsSorted(): SectionConfig[] {
        // ✅ guard + avoid mutate
        return [...(this.sections || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      }
      
    goToBrand(brand: { label: string; value: number | string }) {
        // Navigate with ONLY the human-readable name in the URL
        this.router.navigate(
          ['/app/main/marketplace/products'],
          { queryParams: { brand: brand.label } }
        );
      }

      goToDepartment(department: { label: string; value: number | string }) {
        // Navigate with ONLY the human-readable name in the URL
        this.router.navigate(
          ['/app/main/marketplace/products'],
          { queryParams: { dept: department.label } }
        );
      }

      goToProList(department: { name: string; value: number | string }) {
        // Navigate with ONLY the human-readable name in the URL
        this.router.navigate(
          ['/app/main/marketplace/products'],
          { queryParams: { proList: department.name } }
        );
      }

      
    private chunk<T>(arr: T[], size: number): T[][] {
        const out: T[][] = [];
        for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
        return out;
      }
      
    GetAllAtoSliderSettings() {
        var sliderItems: string[] = [];
        const subs = this._sydObjectsAppService
            .getAllSliderSettings(SliderEnum.CSSB,  undefined)
            .subscribe((result) => {
                result.forEach((img) => {
                    sliderItems.push(img.image);
                });
                console.log(result,'res')
                this.sections = result
                // this.slider.sliderItems = sliderItems;
            });
        this.subscriptions.push(subs);
    }





    // getAdvSettings() {
    //     var _advSliderItems: string[] = [];
    //     const subs = this._sydObjectsAppService
    //         .getAllSliderSettings(SliderEnum.ASMB, this.advSliderCode)
    //         .subscribe((result) => {

    //             result.forEach((img) => {
    //                 _advSliderItems.push(img.image);
    //             });
    //             // this.adv_sm.advSliderItems = advSliderItems;
    //             // this.adv_md.advSliderItems = advSliderItems;
    //             this.advSliderItems=_advSliderItems;
    //         });
    //     this.subscriptions.push(subs);
    // }

    
  getAllBrands() {

    this._appMarketplaceItemsServiceProxy
      .getAllBrandsWithPaging(
        null,
        null,
        null,
        null,
        null,
        "BRAND",
        null,
        null,
        86,
        "name",
        0,
        10, null
      )
      .subscribe((res) => {
        this.brands = res.items;
      });
  }

  getParentDepartments(): Promise<void> {
    return new Promise((resolve) => {
      let apiMethod = "getAllWithChildsForProductWithPaging";
      this._sycEntityObjectCategoriesServiceProxy[apiMethod](
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        true,
        undefined,
        [],
        "name",
        0,
        10
      ).subscribe((res: any) => {
        this.departments = res.items;
        resolve(); // ✅ Important!
      });
    });
  }

    getAllProductCAtalogs() {
      this._appMarketplaceItemsServiceProxy
        .getSharedItemLists(null, "name", 0, 200, undefined)
        .subscribe(
          (res: PagedResultDtoOfGetAllMarketplaceItemListsOutputDto) => {
            this.productList = res.items;
          }
        );
    }


    
    ngOnDestroy() {
      this.unsubscribeToAllSubscriptions();
  }

}
