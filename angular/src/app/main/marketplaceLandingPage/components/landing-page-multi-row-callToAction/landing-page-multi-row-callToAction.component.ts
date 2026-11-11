import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener,
  Injector, Input, OnInit, ViewChild,
} from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { PageSettingDto } from '@shared/service-proxies/service-proxies';
import { ViewEventComponent } from '@app/main/AppEvent/Components/view-event.component';
import { finalize } from 'rxjs';
import { LandingPageBlocksService } from '../../services/landing-page-blocks.service';

@Component({
  selector: 'app-multi-row-callAction',
  templateUrl: './landing-page-multi-row-callToAction.component.html',
  styleUrls: ['./landing-page-multi-row-callToAction.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageMultiRowCallToActionComponent extends AppComponentBase implements OnInit {
  @Input() sectionId!: number;
  @Input() blockTypeIsSingleOrMixed: string;
  @Input() loginTenaneSsin: string;

  @ViewChild('viewEventModal', { static: true }) viewEventModal: ViewEventComponent;

  sliderItems: PageSettingDto[] = [];
  pageGroups: PageSettingDto[][] = [];

  attachmentBaseUrl = this.blocksService.attachmentBaseUrl;
  languageSettingName = this.blocksService.languageSettingName;

  acceptedAspectRatio;
  showMsrP: boolean;
  isArabic = false;
  isSmallScreen = false;
  loading = false;
  hasLoadError = false;

  constructor(
    injector: Injector,
    private cdr: ChangeDetectorRef,
    private blocksService: LandingPageBlocksService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.isArabic = this.blocksService.isArabic;
    this.checkScreenSize();
    if (this.sectionId) this.getBlocksData();
  }

  @HostListener('window:resize')
  checkScreenSize(): void {
    const small = this.blocksService.isSmallScreen();
    if (small !== this.isSmallScreen) {
      this.isSmallScreen = small;
      this.cdr.markForCheck(); // OnPush
    }
  }

  private getBlocksData(): void {
    this.loading = true;
    this.hasLoadError = false;
    this.cdr.markForCheck();

    this.blocksService
      .getSectionBlocks(this.sectionId)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: blocks => this.applyData(blocks),
        error: () => {
          this.applyData([]);
          this.hasLoadError = true;
        },
      });
  }

  private applyData(blocks: PageSettingDto[]): void {
    this.sliderItems = blocks;
    this.pageGroups = this.blocksService.chunk(blocks, 12);
    this.cdr.markForCheck();
  }

  getAspectatio(): void {
    this.getSycAttachmentCategoriesByCodes(['LOGO', 'BANNER', 'IMAGE']).subscribe(result => {
      const imgCat = result.find(x => x.code === 'IMAGE');
      if (imgCat?.aspectRatio) {
        const [w, h] = imgCat.aspectRatio.split(':').map(Number);
        if (w && h) {
          this.acceptedAspectRatio = h / w;
          this.cdr.markForCheck();
        }
      }
    });
  }

  // ---------- delegates to the shared service (template API unchanged) ----------
  viewProduct(prod: any) { this.blocksService.viewProduct(prod); }
  goToProduct(ssin?: string) { this.blocksService.goToProduct(ssin); }
  goToBrand(brand) { this.blocksService.goToBrand(brand); }
  goToCategory(id) { this.blocksService.goToCategory(id); }
  onImgErr(evt: Event) { this.blocksService.onImgErr(evt); }
  fullUrl(path?: string) { return this.blocksService.fullUrl(path); }
  openNewTab(path?: string) { this.blocksService.openNewTab(path); }
  getAttachmentImage(b: PageSettingDto) { return this.blocksService.getAttachmentImage(b); }
  hasPdfAttachment(b: PageSettingDto) { return this.blocksService.hasPdfAttachment(b); }
  getAttachmentClickUrl(b: PageSettingDto) { return this.blocksService.getAttachmentClickUrl(b); }
  onAttachmentClick(b: PageSettingDto) { this.blocksService.onAttachmentClick(b); }
  getBlockTypeIcon(block) { return this.blocksService.getBlockTypeIcon(block); }
  getBlockTypeLabel(block) { return this.l(this.blocksService.getBlockTypeLabelKey(block)); }

  openEventDetails(id: any): void {
    this.viewEventModal.show(id, 0);
  }

  createRelation(account, option): void {
    this.showMainSpinner();
    this.blocksService
      .createRelation(account, option)
      .pipe(finalize(() => { this.hideMainSpinner(); this.cdr.markForCheck(); }))
      .subscribe();
  }

  disconnect(account): void {
    if (!account?.account?.id) return;
    this.showMainSpinner();
    this.blocksService
      .disconnect(account)
      .pipe(finalize(() => { this.hideMainSpinner(); this.cdr.markForCheck(); }))
      .subscribe(() => this.notify.success(this.l('SuccessfullyDisconnected')));
  }
}