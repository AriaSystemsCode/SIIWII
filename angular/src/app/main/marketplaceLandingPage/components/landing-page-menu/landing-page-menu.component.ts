import {
  Component,
  Injector,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';

import {
  SydObjectsServiceProxy
} from '@shared/service-proxies/service-proxies';

import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs';

import {
  SectionItem
} from '../../models/landingPage-types';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LandingPageBlocksService } from '../../services/landing-page-blocks.service';

@Component({
  selector: 'app-landing-page-menu',
  templateUrl: './landing-page-menu.component.html',
  styleUrls: ['./landing-page-menu.component.scss']
})
export class LandingPageMenuComponent extends AppComponentBase implements OnChanges {

  @Input() sections: SectionItem[] = [];

  @Input() backgroundColor = '#ffffff';
  @Input() textColor = '#4A0D4A';

  expandedMenu: number | null = null;

  sectionBlocks: Record<number, any[]> = {};
  loadedSections: Record<number, boolean> = {};
  loadingSections: Record<number, boolean> = {};


  isAuthenticated: boolean = false;
  currentLang: string = 'en';
  isArabic: boolean = false;

  constructor(
    private syd: SydObjectsServiceProxy,
      private blocksService: LandingPageBlocksService,
    injector: Injector
  ) {
    super(injector);
  }


  ngOnChanges(changes: SimpleChanges): void {
    this.isAuthenticated = !!this.appSession?.user;
    this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName')
    this.currentLang == 'ar' || this.currentLang == 'ar-EG' ? this.isArabic = true : this.isArabic = false

    if (changes.sections && this.sections?.length) {
      this.loadAllMenuBlocks();

    }

  }

  loadAllMenuBlocks(): void {

    if (!this.sections?.length) return;

    this.sections.forEach(section => {

      const sectionId = section.sectionId;

      if (sectionId == null) return;

      if (
        this.loadedSections[sectionId] ||
        this.loadingSections[sectionId]
      ) {
        return;
      }

      this.loadSectionBlocks(sectionId);

    });

  }


  loadSectionBlocks(sectionId: number): void {

    if (
      this.loadedSections[sectionId] ||
      this.loadingSections[sectionId]
    ) {
      return;
    }

    this.loadingSections[sectionId] = true;

    this.syd.getAllSectionBlocks(
      sectionId,
      Intl.DateTimeFormat().resolvedOptions().timeZone
    )
      .pipe(
        finalize(() => {
          this.loadingSections[sectionId] = false;
        })
      )
      .subscribe({

        next: (res: any) => {

          const blocks: any[] = Array.isArray(res)
            ? res
            : Array.isArray(res?.result)
              ? res.result
              : Array.isArray(res?.items)
                ? res.items
                : [];

          this.sectionBlocks[sectionId] = [...blocks].sort(
            (a, b) =>
              (a.order ?? 0) - (b.order ?? 0)
          );

          this.loadedSections[sectionId] = true;
        },

        error: (err) => {
          this.sectionBlocks[sectionId] = [];
          this.loadedSections[sectionId] = false;

        }

      });

  }


  toggleMenu(section: SectionItem): void {

    const sectionId = section.sectionId;

    if (sectionId == null) return;

    this.expandedMenu =
      this.expandedMenu === sectionId
        ? null
        : sectionId;

  }


  getBlocks(sectionId: number): any[] {

    return this.sectionBlocks[sectionId] || [];

  }

 openItem(item: any): void {
  if (!item) return;

  const isAttachment = (item.blockType || '').toUpperCase() === 'ATTACHMENT';

  if (isAttachment) {
    // PDF if one exists, otherwise link/externalUrl, otherwise the image, all in a new tab
    this.blocksService.onAttachmentClick(item);
  } else if (!this.blocksService.openBlockLink(item) && this.blocksService.hasPdfAttachment(item)) {
    // no link: fall back to the PDF if the block has one
    this.blocksService.onAttachmentClick(item);
  }

  this.expandedMenu = null;
}



  closeMenu(): void {
    this.expandedMenu = null;
  }

  trackBySection(
    index: number,
    section: SectionItem
  ): number {

    return section.sectionId ?? index;

  }

}
