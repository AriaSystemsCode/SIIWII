import { EventEmitter } from "@angular/core";
import { Output } from "@angular/core";
import { Input } from "@angular/core";
import { Component, OnInit } from "@angular/core";
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';

import { Injector, TemplateRef } from "@angular/core";
import { AppSessionService } from "@shared/common/session/app-session.service";
import {
    CreateOrEditAppPostDto,
    PostType,
} from "@shared/service-proxies/service-proxies";

@Component({
    selector: "app-create-post-entry",
    templateUrl: "./create-post-entry.component.html",
    styleUrls: ["./create-post-entry.component.scss"],
})
export class CreatePostEntryComponent  extends AppComponentBase implements OnInit {
    @Output() _showCreateOrEdit = new EventEmitter<CreateOrEditAppPostDto>();
    @Output() _showCreateOrEditEvent = new EventEmitter<boolean>();
    @Output() typeFile = new EventEmitter<PostType>();
    @Input() profilePicture: string;
    PostType = PostType;
    uploadImage: boolean;
    uploadVideo: boolean;
    isSiiwii: boolean=false;
    tenancyNamePlaceHolderInUrl: string;
    constructor(injector: Injector) {super(injector);}
    ngOnInit(): void {
        this.uploadImage = true;
        this.uploadVideo = true;
        this.isSiiwii = (AppConsts.siiwiiName?.toUpperCase() == this.appSession.tenancyName.toUpperCase());
        
    }

    showCreateOrEdit(typeFile?: PostType) {
        this.typeFile.emit(typeFile);
        this._showCreateOrEdit.emit(null);
    }

    showCreateOrEditEvent() {
        this._showCreateOrEditEvent.emit(true);
    }
}
