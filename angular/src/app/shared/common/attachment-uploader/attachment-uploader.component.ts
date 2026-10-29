
import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    Output
} from '@angular/core';

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

export interface AttachmentUploadSelection {
    file: File;
    thumbnailFile?: File;
    previewUrl?: string;
}

@Component({
    selector: 'app-attachment-uploader',
    templateUrl: './attachment-uploader.component.html',
    styleUrls: ['./attachment-uploader.component.scss']
})
export class AttachmentUploaderComponent implements OnDestroy {

    @Input() maxFileSizeMB = 5;
    @Input() aspectRatio = '1:1';
    @Input() allowPdf = true;
    @Input() allowVideo = true;
    @Input() showThumbnailForMedia = true;

    @Output() attachmentSelected =
        new EventEmitter<AttachmentUploadSelection>();

    @Output() cancelled = new EventEmitter<void>();

    selectedFile: File | null = null;
    thumbnailFile: File | null = null;

    filePreview: string | null = null;
    thumbnailPreview: string | null = null;
    pdfPreview: string | null = null;
    videoPreview: string | null = null;

    errorMessage = '';
    isPdfLoading = false;

    private objectUrls: string[] = [];
    private previewRequestId = 0;
    private destroyed = false;
    constructor() {
    (pdfjsLib as any).GlobalWorkerOptions.workerSrc = '/assets/pdfjs/pdf.worker.min.mjs';
}

    get acceptedFormats(): string {
        const formats = [
            'image/png',
            'image/jpeg',
            'image/webp'
        ];

        if (this.allowPdf) {
            formats.push('application/pdf');
        }

        if (this.allowVideo) {
            formats.push('video/mp4');
        }

        return formats.join(',');
    }

    get isImageFile(): boolean {
        return !!this.selectedFile?.type.startsWith('image/');
    }

    get isPdfFile(): boolean {
        return this.selectedFile?.type === 'application/pdf';
    }

    get isVideoFile(): boolean {
        return this.selectedFile?.type === 'video/mp4';
    }

    // PDF only: video does not need a thumbnail.
    get isMediaFile(): boolean {
        return this.isPdfFile;
    }

    get displayPreview(): string | null {
        if (this.isPdfFile) {
            return this.thumbnailPreview || this.pdfPreview;
        }

        if (this.isImageFile) {
            return this.filePreview;
        }

        return null;
    }

    async onFileSelected(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        input.value = '';

        if (!file) return;

        this.errorMessage = '';

        if (!this.acceptedFormats.split(',').includes(file.type)) {
            this.errorMessage = 'UnsupportedFileFormat';
            return;
        }

        if (file.size > this.maxFileSizeMB * 1024 * 1024) {
            this.errorMessage = 'FileExceedsMaximumSize';
            return;
        }

        this.previewRequestId++;
        const requestId = this.previewRequestId;

        this.clearObjectUrls();

        this.selectedFile = file;
        this.thumbnailFile = null;

        this.filePreview = null;
        this.thumbnailPreview = null;
        this.pdfPreview = null;
        this.videoPreview = null;
        this.isPdfLoading = false;

        if (this.isImageFile) {
            this.filePreview = this.createPreview(file);
        }

        if (this.isVideoFile) {
            this.videoPreview = this.createPreview(file);
        }

        if (this.isPdfFile) {
            await this.generatePdfPreview(file, requestId);
        }
    }

   private async generatePdfPreview(
    file: File,
    requestId: number
): Promise<void> {

    this.isPdfLoading = true;

    let loadingTask: any = null;
    let pdfDocument: any = null;

    try {
        const buffer = await file.arrayBuffer();

        loadingTask = pdfjsLib.getDocument({
            data: new Uint8Array(buffer)
        });

        pdfDocument = await loadingTask.promise;

        const page = await pdfDocument.getPage(1);

        const viewport = page.getViewport({
            scale: 1.5
        });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
            throw new Error('Canvas context unavailable');
        }

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);

        await page.render({
            canvasContext: context,
            viewport
        }).promise;

        if (
            this.destroyed ||
            requestId !== this.previewRequestId
        ) {
            return;
        }

        this.pdfPreview = canvas.toDataURL('image/png');

        this.errorMessage = '';

    } catch (error) {
        console.error(
            '[AttachmentUploader] PDF preview failed:',
            error
        );

        if (
            !this.destroyed &&
            requestId === this.previewRequestId
        ) {
            this.pdfPreview = null;
            this.errorMessage = 'CouldNotGeneratePdfPreview';
        }

    } finally {
        if (pdfDocument) {
            try {
                await pdfDocument.destroy();
            } catch (error) {
                console.warn(
                    '[AttachmentUploader] PDF cleanup failed:',
                    error
                );
            }
        } else if (loadingTask) {
            try {
                await loadingTask.destroy();
            } catch (error) {
                console.warn(
                    '[AttachmentUploader] Loading cleanup failed:',
                    error
                );
            }
        }

        if (
            !this.destroyed &&
            requestId === this.previewRequestId
        ) {
            this.isPdfLoading = false;
        }
    }
}

    onThumbnailSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        input.value = '';

        if (!file || !this.isPdfFile || !this.showThumbnailForMedia) {
            return;
        }

        this.errorMessage = '';

        const allowed = [
            'image/png',
            'image/jpeg',
            'image/webp'
        ];

        if (!allowed.includes(file.type)) {
            this.errorMessage = 'PleaseSelectAnImage';
            return;
        }

        if (file.size > this.maxFileSizeMB * 1024 * 1024) {
            this.errorMessage = 'ThumbnailExceedsMaximumSize';
            return;
        }

        this.revokePreview(this.thumbnailPreview);

        this.thumbnailFile = file;
        this.thumbnailPreview = this.createPreview(file);
    }

    removeThumbnail(): void {
        this.revokePreview(this.thumbnailPreview);

        this.thumbnailFile = null;
        this.thumbnailPreview = null;
        this.errorMessage = '';
    }

    removeFile(): void {
        this.previewRequestId++;

        this.clearObjectUrls();

        this.selectedFile = null;
        this.thumbnailFile = null;

        this.filePreview = null;
        this.thumbnailPreview = null;
        this.pdfPreview = null;
        this.videoPreview = null;

        this.isPdfLoading = false;
        this.errorMessage = '';
    }

    confirmUpload(): void {
    if (!this.selectedFile) {
        return;
    }

    this.attachmentSelected.emit({
        file: this.selectedFile,

        thumbnailFile:
            this.isPdfFile && this.showThumbnailForMedia
                ? this.thumbnailFile || undefined
                : undefined,

        previewUrl: this.displayPreview || undefined
    });
}

    cancel(): void {
        this.removeFile();
        this.cancelled.emit();
    }

    private createPreview(file: File): string {
        const url = URL.createObjectURL(file);

        this.objectUrls.push(url);

        return url;
    }

    private revokePreview(url: string | null): void {
        if (!url) return;

        URL.revokeObjectURL(url);

        this.objectUrls = this.objectUrls.filter(
            item => item !== url
        );
    }

    private clearObjectUrls(): void {
        this.objectUrls.forEach(
            url => URL.revokeObjectURL(url)
        );

        this.objectUrls = [];
    }

    ngOnDestroy(): void {
        this.destroyed = true;
        this.previewRequestId++;
        this.clearObjectUrls();
    }
}
