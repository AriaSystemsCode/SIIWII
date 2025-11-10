import { Component, Injector, Input, OnInit } from "@angular/core";
import { Router } from "@node_modules/@angular/router";
import { AppComponentBase } from "@shared/common/app-component-base";
import { PageSettingDto, SydObjectsServiceProxy } from "@shared/service-proxies/service-proxies";



@Component({
    selector: "app-single-row-callAction",
    templateUrl: "./landing-page-single-row-callAction.component.html",
    styleUrls: ["./landing-page-single-row-callAction.component.scss"],
})
export class LandingPageSinglrRowCallActionComponent extends AppComponentBase implements OnInit {


    @Input() sectionId: number;
    items: PageSettingDto[]
    constructor(injector: Injector, private SydObjectsServiceProxy: SydObjectsServiceProxy, private router: Router,) {
        super(injector);

    }

    ngOnInit() {
        if (this.sectionId) {
            this.getBlocksData()
        }
    }



    private compareByOrder = (a: PageSettingDto, b: PageSettingDto) => {
        const ao = Number.isFinite(a.order as any) ? (a.order as number) : Number.MAX_SAFE_INTEGER;
        const bo = Number.isFinite(b.order as any) ? (b.order as number) : Number.MAX_SAFE_INTEGER;
        return (ao - bo) || ((a.id ?? 0) - (b.id ?? 0));
    };

    get blocksSorted(): PageSettingDto[] {
        return (this.items ?? []).slice().sort(this.compareByOrder);
    }

    getBlocksData() {
        this.SydObjectsServiceProxy.getAllSectionBlocks(this.sectionId).subscribe(res => {
            this.items = res ?? [];
            console.log(this.items, 'rooooow sin')
        });
    }

    goToBrand(brand: { name: string; id: number | string }) {
   
        this.router.navigate(
            ['/app/main/marketplace/products'],
            { queryParams: { brand: brand.name } }
        );
    }

    get visibleCount(): number {
        const n = this.items?.length ?? 0;
        return Math.min(Math.max(n, 1), 5); 
    }

}
