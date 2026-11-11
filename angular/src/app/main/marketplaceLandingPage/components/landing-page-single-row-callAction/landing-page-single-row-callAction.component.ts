import { Component, HostListener, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { PageSettingDto } from '@shared/service-proxies/service-proxies';
import { ViewEventComponent } from '@app/main/AppEvent/Components/view-event.component';
import { EventsBrowseComponentActionsMenuFlags } from '@app/main/AppEventsBrowse/models/EventsBrowseComponentActionsMenuFlags';
import { EventsBrowseComponentStatusesFlags } from '@app/main/AppEventsBrowse/models/EventsBrowseComponentStatusesFlags';
import { finalize } from 'rxjs';
import { LandingPageBlocksService } from '../../services/landing-page-blocks.service';

@Component({
  selector: 'app-single-row-callAction',
  templateUrl: './landing-page-single-row-callAction.component.html',
  styleUrls: ['./landing-page-single-row-callAction.component.scss'],
})
export class LandingPageSinglrRowCallActionComponent extends AppComponentBase implements OnInit {
  @Input() sectionId!: number;
  @Input() blockTypeIsSingleOrMixed: string;
  @Input() loginTenaneSsin: string;

  @ViewChild('viewEventModal', { static: true }) viewEventModal: ViewEventComponent;

  blocksSorted: PageSettingDto[] = [];

  attachmentBaseUrl = this.blocksService.attachmentBaseUrl;
  languageSettingName = this.blocksService.languageSettingName;

  numVisible = 4;
  numVisibleSingle = 4;

  actionsMenuFlags: EventsBrowseComponentActionsMenuFlags;
  statusesFlags: EventsBrowseComponentStatusesFlags;
  acceptedAspectRatio;

  isArabic = false;
  isSmallScreen = false;
  loading = false;
  hasLoadError = false;

  responsiveOptions = [
    { breakpoint: '1400px', numVisible: 4, numScroll: 4 },
    { breakpoint: '1199px', numVisible: 4, numScroll: 4 },
    { breakpoint: '991px', numVisible: 2, numScroll: 2 },
    { breakpoint: '767px', numVisible: 2, numScroll: 2 },
    { breakpoint: '575px', numVisible: 1, numScroll: 1 },
  ];

  responsiveOptionsSingle = [
    { breakpoint: '1400px', numVisible: 4, numScroll: 1 },
    { breakpoint: '1199px', numVisible: 3, numScroll: 1 },
    { breakpoint: '991px', numVisible: 2, numScroll: 1 },
    { breakpoint: '767px', numVisible: 1, numScroll: 1 },
    { breakpoint: '575px', numVisible: 1, numScroll: 1 },
  ];

  constructor(injector: Injector, private blocksService: LandingPageBlocksService) {
    super(injector);
  }

  ngOnInit(): void {
    this.isArabic = this.blocksService.isArabic;
    this.checkScreenSize();
    if (this.sectionId) this.getBlocksData();
  }

  @HostListener('window:resize')
  checkScreenSize(): void {
    this.isSmallScreen = this.blocksService.isSmallScreen();
  }

  getBlocksData(): void {
    if (!this.sectionId) return;

    this.loading = true;
    this.hasLoadError = false;

    this.blocksService
      .getSectionBlocks(this.sectionId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: blocks => (this.blocksSorted = blocks),
        error: () => {
          this.blocksSorted = [];
          this.hasLoadError = true;
        },
      });
  }

  getAspectatio(): void {
    this.getSycAttachmentCategoriesByCodes(['LOGO', 'BANNER', 'IMAGE']).subscribe(result => {
      const imgCat = result.find(x => x.code === 'IMAGE');
      if (imgCat?.aspectRatio) {
        const [w, h] = imgCat.aspectRatio.split(':').map(Number);
        if (w && h) this.acceptedAspectRatio = h / w;
      }
    });
  }

  // ---------- delegates to the shared service (template API unchanged) ----------
  viewProduct(prod: any) { this.blocksService.viewProduct(prod); }
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
      .pipe(finalize(() => this.hideMainSpinner()))
      .subscribe();
  }

  disconnect(account): void {
    if (!account?.account?.id) return;
    this.showMainSpinner();
    this.blocksService
      .disconnect(account)
      .pipe(finalize(() => this.hideMainSpinner()))
      .subscribe(() => this.notify.success(this.l('SuccessfullyDisconnected')));
  }
}