import { Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ajax } from 'rxjs/ajax';

@Component({
    selector: 'app-link-preview',
    templateUrl: './link-preview.component.html',
    styleUrls: ['./link-preview.component.scss']
})
export class LinkPreviewComponent extends AppComponentBase implements OnChanges {
    @Input() url: string
    @Input() title: string
    @Input() maxHeight: string = '260px'
    @Input() folderName: string = "attachments"
    urlPreviewBaseUrl = AppConsts.attachmentBaseUrl
    @Input() urlPreviewImage : string
    hide:boolean = true
    @Output() removeLinkPreview : EventEmitter<boolean> = new EventEmitter<boolean>()
    constructor(injector:Injector) {
        super(injector);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.url ) {
            this.hide = false
        }
    }

    close(){
        this.hide = true
        this.removeLinkPreview.emit(true)
    }
}
