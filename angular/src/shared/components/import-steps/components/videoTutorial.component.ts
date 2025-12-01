// <!-- Iteration-8 -->
import { EventEmitter, OnInit, Output, ViewChild } from "@angular/core";
import { Injector } from "@angular/core";
import { Component } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { BsModalService, ModalDirective } from "ngx-bootstrap/modal";

@Component({
    selector: "videoTutorialModal",
    templateUrl: './videoTutorial.component.html',
    styleUrls: ['./videoTutorial.component.scss'],

})
export class videoTutorialComponent extends AppComponentBase implements OnInit {
    @ViewChild('videoTutorial', { static: true }) modal: ModalDirective;
    @Output() goPrevious: EventEmitter<any> = new EventEmitter<any>();
    videoTutorialUrl;
    @Output() close = new EventEmitter<boolean>();

    public constructor(
        private _BsModalService: BsModalService,
        private injector: Injector) {
        super(injector);
    }

    ngOnInit() {

    }

    show(videoTutorial) {
        this.videoTutorialUrl=videoTutorial?.excelTemplateFullPath;
        this.modal.show();
    }

    hide() {
        this.modal.hide();
    }

    goPreviousStep() {
        this.goPrevious.emit();
    }

    askToClose()
{
    this.close.emit(true);
}
    

}