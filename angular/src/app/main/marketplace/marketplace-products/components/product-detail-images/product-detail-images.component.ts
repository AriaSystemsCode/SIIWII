
import {
    Component,
    EventEmitter,
    Input,
    Output,
    OnDestroy,
    OnInit
} from '@angular/core';

import { AppConsts } from '@shared/AppConsts';

import {
    AppEntityAttachmentDto,
    AppItemsServiceProxy
} from '@shared/service-proxies/service-proxies';

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

type MediaKind = 'image' | 'video' | 'pdf' | 'other';

interface ProductAttachmentView extends AppEntityAttachmentDto {
    previewAttachment?: AppEntityAttachmentDto;
}

@Component({
    selector: 'app-product-detail-images',
    templateUrl: './product-detail-images.component.html',
    styleUrls: ['./product-detail-images.component.scss']
})
export class ProductDetailImagesComponent
    implements OnInit, OnDestroy {

    // ================= INPUTS / OUTPUTS =================

    private rawProductImages: AppEntityAttachmentDto[] = [];

    @Input()
    set productImages(value: AppEntityAttachmentDto[]) {
        this.rawProductImages = value || [];
        this.setActiveAttachments(this.rawProductImages);
    }

    get productImages(): ProductAttachmentView[] {
        return this.activeAttachments;
    }

    @Input()
    colorAttachmentForMainIamge: string;

    @Input()
    colorView = false;

    @Output()
    setColorView = new EventEmitter<boolean>();

    // ================= GALLERY =================

    attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;

    activeAttachments: ProductAttachmentView[] = [];

    currentIndex = 0;
    translateY = 0;

    showbar = false;
    loadingError = false;

    // ================= PDF =================

    pdfThumbMap: Record<number, string | null> = {};

    pdfThumbLoadingMap: Record<number, boolean> = {};

    private pdfThumbByPath: Record<string, string> = {};

    private pdfPreviewInProgress = new Set<string>();

    private failedPdfPaths = new Set<string>();

    private galleryVersion = 0;

    // ================= IMAGE PREVIEW =================

    showImagePreview = false;
    previewImageUrl = '';

    // ================= CONSTRUCTOR =================

    constructor(
        private _appItemsServiceProxy: AppItemsServiceProxy
    ) {
        (pdfjsLib as any).GlobalWorkerOptions.workerSrc =
            '/assets/pdfjs/pdf.worker.min.mjs';
    }

    // ================= LIFECYCLE =================

    ngOnInit(): void {
        // Gallery is initialized by the productImages setter.
    }

    ngOnDestroy(): void {
        this.galleryVersion++;
        this.pdfPreviewInProgress.clear();
    }

    // ================= ATTACHMENT GROUPING =================

private setActiveAttachments(
    list: AppEntityAttachmentDto[]
): void {

    this.galleryVersion++;

    const attachments = (list || []).filter(
        item => !!item?.url
    );

    const usedThumbnailPositions = new Set<number>();

    const pdfThumbnailPositions = new Map<number, number>();

    // Match PDFs with uploaded non-default image thumbnails.
    attachments.forEach((pdf, pdfPosition) => {

        if (
            this.kindOf(pdf) !== 'pdf' ||
            pdf.index == null
        ) {
            return;
        }

        const thumbnailPosition = attachments.findIndex(
            (candidate, candidatePosition) =>

                this.kindOf(candidate) === 'image' &&

                // Default images are standalone product images.
                candidate.isDefault !== true &&

                // Match the PDF index.
                candidate.index === pdf.index &&

                // Do not reuse an image for multiple PDFs.
                !usedThumbnailPositions.has(candidatePosition)
        );

        if (thumbnailPosition !== -1) {

            pdfThumbnailPositions.set(
                pdfPosition,
                thumbnailPosition
            );

            usedThumbnailPositions.add(
                thumbnailPosition
            );
        }
    });

    const result: ProductAttachmentView[] = [];

    attachments.forEach((item, position) => {

        // Hide only images already assigned as PDF thumbnails.
        if (
            this.kindOf(item) === 'image' &&
            usedThumbnailPositions.has(position)
        ) {
            return;
        }

        if (this.kindOf(item) === 'pdf') {

            const thumbnailPosition =
                pdfThumbnailPositions.get(position);

            const previewAttachment =
                thumbnailPosition !== undefined
                    ? attachments[thumbnailPosition]
                    : undefined;

            result.push({
                ...item,
                previewAttachment
            } as ProductAttachmentView);

            return;
        }

        // Keep standalone images, videos, and other files.
        result.push({
            ...item
        } as ProductAttachmentView);
    });

    this.activeAttachments = result;

    this.currentIndex = 0;
    this.translateY = 0;
    this.loadingError = false;

    this.pdfThumbMap = {};
    this.pdfThumbLoadingMap = {};

    this.preloadVisiblePdfThumbs();
}
    // ================= MEDIA TYPE =================

    kindOf(item: any): MediaKind {

        if (!item) {
            return 'other';
        }

        const mime =
            (item.mimeType || '').toLowerCase();

        const fileName =
            (item.fileName || item.url || '')
                .split('?')[0]
                .split('#')[0]
                .toLowerCase();

        if (mime.startsWith('image/')) {
            return 'image';
        }

        if (mime === 'application/pdf') {
            return 'pdf';
        }

        if (mime.startsWith('video/')) {
            return 'video';
        }

        if (/\.(jpg|jpeg|png|webp|gif|svg)$/.test(fileName)) {
            return 'image';
        }

        if (/\.pdf$/.test(fileName)) {
            return 'pdf';
        }

        if (/\.(mp4|webm|ogg)$/.test(fileName)) {
            return 'video';
        }

        return 'other';
    }

    // ================= URL =================

    getUrl(item: any): string {

        const url = (item?.url || '').trim();

        if (!url) {
            return '';
        }

        if (/^https?:\/\//i.test(url)) {
            return url;
        }

        if (url.startsWith('assets/')) {
            return '/' + url;
        }

        const base =
            (this.attachmentBaseUrl || '')
                .replace(/\/$/, '');

        const path = url.replace(/^\//, '');

        return `${base}/${path}`;
    }

    // ================= GALLERY NAVIGATION =================

    get mediaLen(): number {
        return this.activeAttachments.length;
    }

    setMainImage(index: number): void {

        if (
            index < 0 ||
            index >= this.activeAttachments.length
        ) {
            return;
        }

        this.currentIndex = index;

        const item = this.activeAttachments[index];

        if (this.kindOf(item) !== 'pdf') {
            this.setColorView.emit(false);
            this.colorView = false;
        }

        this.preparePdfIfNeeded(index);
    }

    slideToNextImage(): void {

        if (!this.mediaLen) {
            return;
        }

        this.setColorView.emit(false);
        this.colorView = false;

        this.currentIndex =
            (this.currentIndex + 1) % this.mediaLen;

        this.translateY = -this.currentIndex * 50;

        this.preparePdfIfNeeded(this.currentIndex);
    }

    slideToPreviousImage(): void {

        if (!this.mediaLen) {
            return;
        }

        this.setColorView.emit(false);
        this.colorView = false;

        this.currentIndex =
            (this.currentIndex - 1 + this.mediaLen)
            % this.mediaLen;

        this.translateY = -this.currentIndex * 50;

        this.preparePdfIfNeeded(this.currentIndex);
    }

    // ================= PDF PRELOAD =================

    private preloadVisiblePdfThumbs(): void {

        const visibleCount = Math.min(
            this.activeAttachments.length,
            7
        );

        for (let i = 0; i < visibleCount; i++) {

            if (
                this.kindOf(this.activeAttachments[i]) === 'pdf'
            ) {
                this.preparePdfIfNeeded(i);
            }
        }
    }

    // ================= PDF PREVIEW =================

  
private async preparePdfIfNeeded(index: number): Promise<void> {

    const item = this.activeAttachments?.[index];

    if (!item || this.kindOf(item) !== 'pdf') {
        return;
    }

    const path = (item.url || '').trim();

    if (!path) {
        this.pdfThumbMap[index] = null;
        this.pdfThumbLoadingMap[index] = false;
        return;
    }

    // =========================================
    // 1. USE UPLOADED IMAGE AS PDF THUMBNAIL
    // =========================================

    if (item.previewAttachment?.url) {

        this.pdfThumbMap[index] =
            this.getUrl(item.previewAttachment);

        this.pdfThumbLoadingMap[index] = false;

        return;
    }

    // =========================================
    // 2. USE CACHED PDF.JS PREVIEW
    // =========================================

    if (this.pdfThumbByPath[path]) {

        this.pdfThumbMap[index] =
            this.pdfThumbByPath[path];

        this.pdfThumbLoadingMap[index] = false;

        return;
    }

    // =========================================
    // 3. PREVIOUSLY FAILED PDF
    // =========================================

    if (this.failedPdfPaths.has(path)) {

        this.pdfThumbMap[index] = null;
        this.pdfThumbLoadingMap[index] = false;

        return;
    }

    // =========================================
    // 4. PREVENT DUPLICATE PDF REQUESTS
    // =========================================

    if (this.pdfPreviewInProgress.has(path)) {

        this.pdfThumbLoadingMap[index] = true;

        return;
    }

    this.pdfPreviewInProgress.add(path);
    this.pdfThumbLoadingMap[index] = true;

    const version = this.galleryVersion;
    const fullUrl = this.getUrl(item);

    try {

        // =====================================
        // 5. FETCH PDF AS BASE64
        // =====================================

        const response = await this._appItemsServiceProxy
            .getFile64FromUrl(fullUrl)
            .toPromise();

        if (!response || typeof response !== 'string') {
            throw new Error('Invalid PDF Base64 response');
        }

        const base64 = response.includes(',')
            ? response.split(',').pop()!
            : response;

        const binary = atob(
            base64.replace(/\s/g, '')
        );

        const bytes = new Uint8Array(binary.length);

        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }

        // =====================================
        // 6. VALIDATE PDF FILE
        // =====================================

        const signature = String.fromCharCode(
            ...bytes.slice(0, 5)
        );

        if (signature !== '%PDF-') {
            throw new Error('Invalid PDF file content');
        }

        // =====================================
        // 7. GENERATE FIRST-PAGE PREVIEW
        // =====================================

        const blob = new Blob(
            [bytes],
            { type: 'application/pdf' }
        );

        const preview = await this.buildPdfThumbFromBlob(
            blob,
            420
        );

        // Cache generated preview.
        this.pdfThumbByPath[path] = preview;

        // Prevent old requests from updating a new gallery.
        if (version !== this.galleryVersion) {
            return;
        }

        // =====================================
        // 8. UPDATE ALL MATCHING PDF ITEMS
        // =====================================

        this.activeAttachments.forEach((attachment, i) => {

            if (
                this.kindOf(attachment) === 'pdf' &&
                attachment.url === path &&
                !attachment.previewAttachment?.url
            ) {
                this.pdfThumbMap[i] = preview;
            }

        });

    } catch (error) {

        console.error(
            '[ProductDetailImages] PDF preview failed:',
            fullUrl,
            error
        );

        this.failedPdfPaths.add(path);

        if (version === this.galleryVersion) {

            this.activeAttachments.forEach((attachment, i) => {

                if (
                    this.kindOf(attachment) === 'pdf' &&
                    attachment.url === path
                ) {
                    this.pdfThumbMap[i] = null;
                }

            });
        }

    } finally {

        this.pdfPreviewInProgress.delete(path);

        if (version === this.galleryVersion) {

            this.activeAttachments.forEach((attachment, i) => {

                if (
                    this.kindOf(attachment) === 'pdf' &&
                    attachment.url === path
                ) {
                    this.pdfThumbLoadingMap[i] = false;
                }

            });
        }
    }
}

    // ================= PDF.JS RENDERING =================

    private async buildPdfThumbFromBlob(
        blob: Blob,
        targetWidth = 420
    ): Promise<string> {

        const bytes = new Uint8Array(
            await blob.arrayBuffer()
        );

        const loadingTask = pdfjsLib.getDocument({
            data: bytes
        });

        const pdf = await loadingTask.promise;

        try {

            const page = await pdf.getPage(1);

            const originalViewport =
                page.getViewport({
                    scale: 1
                });

            const scale =
                targetWidth / originalViewport.width;

            const viewport =
                page.getViewport({
                    scale
                });

            const canvas =
                document.createElement('canvas');

            const context =
                canvas.getContext('2d');

            if (!context) {
                throw new Error(
                    'Canvas context unavailable'
                );
            }

            canvas.width =
                Math.ceil(viewport.width);

            canvas.height =
                Math.ceil(viewport.height);

            await page.render({
                canvasContext: context,
                viewport
            }).promise;

            const preview =
                canvas.toDataURL('image/png');

            page.cleanup();

            return preview;

        } finally {
            await pdf.destroy();
        }
    }

    // ================= PDF IMAGE ERROR =================

  onPdfPreviewError(index: number): void {

    const item = this.activeAttachments[index];

    if (!item) return;

    this.pdfThumbMap[index] = null;
    this.pdfThumbLoadingMap[index] = false;

    if (item.url) {
        delete this.pdfThumbByPath[item.url];
        this.failedPdfPaths.add(item.url);
    }
}

    // ================= OPEN PDF / FILE =================

    openNewTab(
        item: AppEntityAttachmentDto
    ): void {

        const url = this.getUrl(item);

        if (!url) {
            return;
        }

        window.open(
            url,
            '_blank',
            'noopener,noreferrer'
        );
    }

    // ================= IMAGE PREVIEW =================

    openImagePreview(url: string): void {

        if (!url) {
            return;
        }

        this.previewImageUrl = url;
        this.showImagePreview = true;
    }

    // ================= DOWNLOAD =================

    downloadFile(item: any): void {

        const url = this.getUrl(item);

        if (!url) {
            return;
        }

        const fileName =
            item?.fileName?.trim?.() ||
            url.split('?')[0]
                .split('#')[0]
                .split('/')
                .pop() ||
            'file';

        const anchor =
            document.createElement('a');

        anchor.href = url;
        anchor.setAttribute(
            'download',
            fileName
        );

        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    }
}
