import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AppConsts } from '@shared/AppConsts';
import {
  AccountsServiceProxy,
  PageSettingDto,
  SydObjectsServiceProxy,
} from '@shared/service-proxies/service-proxies';

declare const abp: any;

@Injectable({ providedIn: 'root' })
export class LandingPageBlocksService {
  readonly attachmentBaseUrl = AppConsts.attachmentBaseUrl;
  readonly languageSettingName: string = AppConsts.languageSettingName;
  readonly placeholderUrl = '/assets/placeholders/_logo-placeholder.png';

  constructor(
    private router: Router,
    private syd: SydObjectsServiceProxy,
    private accountsService: AccountsServiceProxy
  ) {}

  // ---------- language / screen ----------
  get isArabic(): boolean {
    const lang = abp.utils.getCookieValue('Abp.Localization.CultureName');
    return lang === 'ar' || lang === 'ar-EG';
  }

  isSmallScreen(): boolean {
    return window.innerWidth <= 1023;
  }

  // ---------- data ----------
  /** Loads the section blocks and returns them sorted by order, then id. */
  getSectionBlocks(sectionId: number): Observable<PageSettingDto[]> {
    return this.syd
      .getAllSectionBlocks(sectionId, Intl.DateTimeFormat().resolvedOptions().timeZone)
      .pipe(map(res => this.sortBlocks(res ?? [])));
  }

  sortBlocks(blocks: PageSettingDto[]): PageSettingDto[] {
    const val = (x: any) =>
      Number.isFinite(x?.order) ? (x.order as number) : Number.MAX_SAFE_INTEGER;
    return blocks
      .slice()
      .sort((a: any, b: any) => (val(a) - val(b)) || ((a?.id ?? 0) - (b?.id ?? 0)));
  }

  chunk<T>(arr: T[], size: number): T[][] {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  }

  // ---------- urls / files ----------
  fullUrl(path?: string): string {
    const p = (path ?? '').trim();
    if (!p) return '';
    if (/^https?:\/\//i.test(p)) return p;
    if (p.startsWith('assets/')) return `/${p}`;
    return `${this.attachmentBaseUrl?.replace(/\/$/, '')}/${p.replace(/^\//, '')}`;
  }

  isPdf(path?: string) { return !!path && /\.pdf($|\?)/i.test(path); }
  isImg(path?: string) { return !!path && /\.(jpe?g|png|webp|gif|svg)($|\?)/i.test(path); }
  isVideo(path?: string) { return !!path && /\.(mp4|webm|ogg)($|\?)/i.test(path); }
    isExcel(path?: string) { return !!path && /\.(xlsx?|xlsm|xlsb|xls)($|\?)/i.test(path); }
  /** Files that open on click instead of being previewed (PDF, Excel). */
  isDocFile(path?: string) { return this.isPdf(path) || this.isExcel(path); }

  onImgErr(evt: Event): void {
    (evt.target as HTMLImageElement).src = this.placeholderUrl;
  }

  openNewTab(path?: string): void {
    window.open(this.fullUrl(path));
  }

  getAttachmentImage(b: PageSettingDto): string | null {
    if (!b) return null;
    if (this.isImg(b.image)) return this.fullUrl(b.image);

    const imgAtt = b.entityAttachments?.find(att => this.isImg(att?.url || att?.fileName));
    return imgAtt ? this.fullUrl(imgAtt.url || imgAtt.fileName) : null;
  }

  //  hasPdfAttachment(b: PageSettingDto): boolean {
  //   return !!this.getAttachmentPdfUrl(b);
  // }

  // getAttachmentPdfUrl(b: PageSettingDto): string | null {
  //   if (!b) return null;

  //   const pdfAtt = b.entityAttachments?.find(att => this.isPdf(att?.url || att?.fileName));
  //   if (pdfAtt) return this.fullUrl(pdfAtt.url || pdfAtt.fileName);

  //   // block.image itself may be the pdf (as in block 653385)
  //   return this.isPdf(b.image) ? this.fullUrl(b.image) : null;
  // }

    /** First PDF/Excel file on the block (entityAttachments first, then block.image). */
  getAttachmentFileUrl(b: PageSettingDto): string | null {
    if (!b) return null;

    const att = b.entityAttachments?.find(a => this.isDocFile(a?.url || a?.fileName));
    if (att) return this.fullUrl(att.url || att.fileName);

    return this.isDocFile(b.image) ? this.fullUrl(b.image) : null;
  }

  hasAttachmentFile(b: PageSettingDto): boolean {
    return !!this.getAttachmentFileUrl(b);
  }

  /** Icon shown when the block has a file but no image preview. */
  getAttachmentFileIcon(b: PageSettingDto): string {
    return this.isExcel(this.getAttachmentFileUrl(b) ?? '')
      ? 'assets/Items/excel-Icon.png'
      : 'assets/Items/pdf-Icon.png';
  }

  // aliases so existing templates/components keep working
  hasPdfAttachment(b: PageSettingDto): boolean { return this.hasAttachmentFile(b); }
  getAttachmentPdfUrl(b: PageSettingDto): string | null { return this.getAttachmentFileUrl(b); }

  getAttachmentClickUrl(b: PageSettingDto): string | null {
    if (!b) return null;

    // const pdfUrl = this.getAttachmentPdfUrl(b);
    // if (pdfUrl) return pdfUrl;
        const fileUrl = this.getAttachmentFileUrl(b);
    if (fileUrl) return fileUrl;

    if ((b as any).link) return (b as any).link;
    if (b.externalUrl) return b.externalUrl;
    if (b.linkPageUrl) return b.linkPageUrl;

    return this.getAttachmentImage(b);
  }

  onAttachmentClick(b: PageSettingDto): void {
    const url = this.getAttachmentClickUrl(b);
    if (!url) return;
    const finalUrl = /^https?:\/\//i.test(url) ? url : this.fullUrl(url);
    window.open(finalUrl, '_blank', 'noopener');
  }

  // ---------- navigation ----------
  viewProduct(prod: any): void {
    localStorage.setItem(
      'productData',
      JSON.stringify({ id: prod?.appItem?.id, sellerSSIN: prod?.sellerSSIN })
    );
    this.router.navigate(['/app/main/marketplace/products/view', prod?.appItem?.id]);
  }

  goToProduct(ssin?: string): void {
    if (ssin) this.router.navigate(['/app/main/app-items/view', ssin]);
  }

  goToBrand(brand: any): void {
    this.router.navigate(['/app/main/marketplace/products'], {
      queryParams: { brand: brand?.getAppEntityForViewDto?.appEntity?.id },
    });
  }

  goToCategory(id: any): void {
    this.router.navigate(['/app/main/marketplace/products'], { queryParams: { cat: id } });
  }

  // ---------- block type label / icon ----------
  /** Returns the localization KEY. The component calls this.l(key). */
  getBlockTypeLabelKey(block: any): string {
    switch ((block?.blockType ?? '').toUpperCase()) {
      case 'EVENT':
        return block?.getAppEventForViewDto?.appEvent?.isOnLine ? 'OnlineEvent' : 'InPersonEvent';
      case 'CONTACT': {
        const type = block?.getAccountForViewDto?.account?.accountType;
        if (type === 'BUSINESS') return 'BUSINESSAccount';
        if (type === 'PERSONAL') return 'PERSONALAccount';
        return 'GROUPAccount';
      }
      case 'PRODUCT': return 'Product';
      case 'ATTACHMENT': return 'Link';
      case 'BRAND': return 'Brand';
      case 'CATEGORY': return 'Category';
      default: return 'Block';
    }
  }

  getBlockTypeIcon(block: any): string {
    switch ((block?.blockType ?? '').toUpperCase()) {
      case 'EVENT':
        return block?.getAppEventForViewDto?.appEvent?.isOnLine ? 'fas fa-video' : 'fas fa-map-marker-alt';
      case 'CONTACT': {
        const type = block?.getAccountForViewDto?.account?.accountType;
        if (type === 'BUSINESS') return 'fas fa-building';
        if (type === 'PERSONAL') return 'fas fa-user';
        return 'fas fa-users';
      }
      case 'PRODUCT': return 'fas fa-shopping-bag';
      case 'ATTACHMENT': return 'fas fa-paperclip';
      case 'BRAND': return 'fas fa-tag';
      case 'CATEGORY': return 'fas fa-th-large';
      default: return 'fas fa-square';
    }
  }

  // ---------- account relations ----------
  /** Mutates `account` on success. The component handles spinner / notify. */
  createRelation(account: any, option: any): Observable<void> {
    return this.accountsService
      .applyRelationOnProfile(
        account?.account?.id,
        undefined,
        (option?.relation?.defaultVisibility || '').toLowerCase() === 'public',
        option?.relation?.connectionEntityId
      )
      .pipe(
        tap((result: any) => {
          const raw = (typeof result === 'string' ? result : result?.result) || '';
          const parsed = this.parseRelationResult(raw);
          account.availableConnections = [];
          account.avaliableConnectionName = '';
          account.connectionName = parsed.connectionName;
          account.disConnectLabel = parsed.disconnectLabel;
        }),
        map(() => void 0)
      );
  }

  disconnect(account: any): Observable<void> {
    return this.accountsService.disconnect(account?.account?.id, undefined).pipe(
      tap((res: any) => {
        const options = Array.isArray(res) ? res : [];
        account.connectionName = '';
        account.disConnectLabel = '';
        account.availableConnections = options;
        account.avaliableConnectionName = options?.[0]?.connectLabel || '';
      }),
      map(() => void 0)
    );
  }

  private parseRelationResult(raw: string): { connectionName: string; disconnectLabel: string } {
    const text = (raw || '').trim();
    const idx = text.indexOf('-');
    return {
      connectionName: idx > -1 ? text.slice(0, idx).trim() : text,
      disconnectLabel: idx > -1 ? text.slice(idx + 1).trim() : 'MPActionDisconnect',
    };
  }

    /** link / externalUrl / linkPageUrl, in that order. */
  getBlockLinkUrl(b: PageSettingDto): string | null {
    const raw = (b as any)?.link || b?.externalUrl || b?.linkPageUrl;
    if (!raw) return null;
    return /^https?:\/\//i.test(raw) ? raw : this.fullUrl(raw);
  }

  /** Opens the block's link in a new tab. Returns false if the block has no link. */
  openBlockLink(b: PageSettingDto): boolean {
    const url = this.getBlockLinkUrl(b);
    if (!url) return false;
    window.open(url, '_blank', 'noopener,noreferrer');
    return true;
  }


}