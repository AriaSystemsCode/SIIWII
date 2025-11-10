import { Component, Injector, Input, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponentBase } from '@shared/common/app-component-base';
import { PageSettingDto, SydObjectsServiceProxy } from '@shared/service-proxies/service-proxies';

@Component({
  selector: 'app-multi-row-callAction',
  templateUrl: './landing-page-multi-row-callToAction.component.html',
  styleUrls: ['./landing-page-multi-row-callToAction.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingPageMultiRowCallToActionComponent extends AppComponentBase implements OnInit {
  @Input() sectionId!: number;

  sliderItems: PageSettingDto[] = [];
  pageGroups: PageSettingDto[][] = [];

  constructor(
    injector: Injector,
    private sydObjectsService: SydObjectsServiceProxy,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { super(injector); }

  ngOnInit(): void {
    if (this.sectionId) this.getBlocksData();
  }

  private compareByOrder = (a: PageSettingDto, b: PageSettingDto) => {
    const ao = Number.isFinite((a as any)?.order) ? (a as any).order as number : Number.MAX_SAFE_INTEGER;
    const bo = Number.isFinite((b as any)?.order) ? (b as any).order as number : Number.MAX_SAFE_INTEGER;
    return (ao - bo) || (((a as any)?.id ?? 0) - ((b as any)?.id ?? 0));
  };

  private getBlocksData(): void {
    this.sydObjectsService.getAllSectionBlocks(this.sectionId).subscribe({
      next: (res) => this.applyData(res ?? []),
      error: () => this.applyData([])
    });
  }

  private applyData(blocks: PageSettingDto[]): void {
    this.sliderItems = blocks.slice().sort(this.compareByOrder);
    this.pageGroups = this.chunk(this.sliderItems, 9); // 3x3 grid per slide
    console.log(this.sliderItems,'rees')

    this.cdr.markForCheck();
  }

  private chunk<T>(arr: T[], size: number): T[][] {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  }

  goToProduct(ssin?: string) {
    if (ssin) this.router.navigate(['/app/main/app-items/view', ssin]);
  }
  goToBrand(brand: { name: string; id: number | string }) {
   
    this.router.navigate(
        ['/app/main/marketplace/products'],
        { queryParams: { brand: brand.name } }
    );
}
}
