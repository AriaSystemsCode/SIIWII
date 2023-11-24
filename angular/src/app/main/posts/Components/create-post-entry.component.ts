import { EventEmitter } from "@angular/core";
import { Output } from "@angular/core";
import { Input } from "@angular/core";
import { Component, OnInit } from "@angular/core";
import {
    CreateOrEditAppPostDto,
    PostType,
} from "@shared/service-proxies/service-proxies";

@Component({
    selector: "app-create-post-entry",
    templateUrl: "./create-post-entry.component.html",
    styleUrls: ["./create-post-entry.component.scss"],
})
export class CreatePostEntryComponent implements OnInit {
    @Output() _showCreateOrEdit = new EventEmitter<CreateOrEditAppPostDto>();
    @Output() _showCreateOrEditEvent = new EventEmitter<boolean>();
    @Output() typeFile = new EventEmitter<PostType>();
    @Input() profilePicture: string;
    PostType = PostType;
    uploadImage: boolean;
    uploadVideo: boolean;

    constructor() {}
    ngOnInit(): void {
        this.uploadImage = true;
        this.uploadVideo = true;
    }

    showCreateOrEdit(typeFile?: PostType) {
        this.typeFile.emit(typeFile);
        this._showCreateOrEdit.emit(null);
    }

    showCreateOrEditEvent() {
        this._showCreateOrEditEvent.emit(true);
    }
}
