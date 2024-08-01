import {
    AfterViewInit,
    ElementRef,
    Input,
    OnDestroy,
    Output,
    QueryList,
    ViewChild,
    ViewChildren,
} from "@angular/core";
import { Injector } from "@angular/core";
import { OnChanges } from "@angular/core";
import { SimpleChanges } from "@angular/core";
import { EventEmitter } from "@angular/core";
import { Component } from "@angular/core";
import { InteractionsComponent } from "@app/main/interactions/components/interactions.component";
import { AppComponentBase } from "@shared/common/app-component-base";
import {
    AppEntitiesRelationshipDto,
    AppEntitiesServiceProxy,
    AppEntityTypes,
    AppPostsServiceProxy,
    GetAppPostForViewDto,
    PostType,
} from "@shared/service-proxies/service-proxies";
import { PostListService } from "../Services/post-list.service";

@Component({
    selector: "app-post-card",
    templateUrl: "./post-card.component.html",
    styleUrls: ["./post-card.component.scss"],
})
export class PostCardComponent
    extends AppComponentBase
    implements OnChanges, OnDestroy, AfterViewInit
{
    @Input() isCurrentVideo: boolean;
    @Input() post: GetAppPostForViewDto = null;
    @Output() showViewPost = new EventEmitter<GetAppPostForViewDto>();
    @Output() _deletePost = new EventEmitter<GetAppPostForViewDto>();
    @Output() _editPost = new EventEmitter<GetAppPostForViewDto>();
    @Output() _viewEvent = new EventEmitter<number>();
    @Output() videoClicked: EventEmitter<any> = new EventEmitter<any>();
    addNewThread:boolean=true;
    linkUrl: string = null;
    PostType = PostType;
    profilePicture: string;
    isHost: boolean = false;
    urlPreviewImage: string;
    @ViewChild("InteractionsComponent")
    InteractionsComponent: InteractionsComponent;
    getAppEntityForViewDto: AppEntitiesRelationshipDto = null;
    appEntityTypes = AppEntityTypes;

    constructor(
        private _postService: AppPostsServiceProxy,
        private _entitiesService: AppEntitiesServiceProxy,
        private _postlist: PostListService,
        private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
        injector: Injector
    ) {
        super(injector);
        this.isHost = !this.appSession.tenantId;
    }
    ngAfterViewInit(): void {
        throw new Error("Method not implemented.");
    }

    ngOnChanges(changes: SimpleChanges) {
       
        if (this.post) {
            //Get ProfilePicture
            this.getProfilePictureById(this.post.appPost.profilePictureId);
            //Get linkUrl
            this.linkUrl = this._postlist.onChangeBody(
                this.post.appPost.description
            );
            this.post.appPost.embeddedLink = this.linkUrl;
            if (this.linkUrl && this.post.type === PostType.TEXT) {
                this.urlPreviewImage = this.post.attachmentsURLs[0];
            }
        }
        const post = GetAppPostForViewDto.fromJS(this.post.toJSON());
        this.post = post;
        this.getRelatedEntity();
        this.scrollableDiv.nativeElement.addEventListener("scroll", () => {
            this.detectHiddenSections();
        });
    }

    ngOnDestroy() {
        this.emitDestroy();
    }

    getProfilePictureById(id: string) {
        const subs = this._postService
            .getProfilePictureAllByID(id)
            .subscribe((data) => {
                if (data.profilePicture) {
                    this.profilePicture =
                        "data:image/jpeg;base64," + data.profilePicture;
                    this.post.appPost.profilePictureUrl = this.profilePicture;
                }
            });
        this.subscriptions.push(subs);
    }

    getRelatedEntity() {
        const subs = this._entitiesService
            .getAppEntityRelations(this.post.appPost.appEntityId)
            .subscribe((res) => {
                var indx = res?.appEntity?.entitiesRelationships.findIndex(
                    (x) =>
                        x.relatedEntityTypeCode.toUpperCase() ==
                        this.appEntityTypes[this.appEntityTypes.EVENT]
                            .toString()
                            .toUpperCase()
                );

                if (indx >= 0)
                    this.getAppEntityForViewDto =
                        res.appEntity.entitiesRelationships[indx];
                else this.getAppEntityForViewDto = null;
            });
        this.subscriptions.push(subs);
    }

    onshowViewPost() {
        this.InteractionsComponent.createView();
        if (this.post.type == PostType.TEXT) return;
        this.showViewPost.emit(this.post);
    }

    editPost() {
        this._editPost.emit(this.post);
    }

    deletePost() {
        this._deletePost.emit(this.post);
    }

    viewRelatedEntity() {
        if (
            this.getAppEntityForViewDto?.relatedEntityTypeCode?.toUpperCase() ==
            AppEntityTypes[AppEntityTypes.EVENT].toString().toUpperCase()
        )
            this._viewEvent.emit(this.getAppEntityForViewDto.relatedEntityId);
        this.InteractionsComponent.createView();
    }

    currentPlayingVideo: HTMLVideoElement;
    onPlayingVideo(event) {
        console.log(event.target, this.currentPlayingVideo);
        event.preventDefault();
        // play the first video that is chosen by the user
        if (this.currentPlayingVideo === undefined) {
            this.currentPlayingVideo = event.target;
            this.currentPlayingVideo.play();
        } else {
            // if the user plays a new video, pause the last
            // one and play the new one
            if (event.target !== this.currentPlayingVideo) {
                this.currentPlayingVideo.pause();
                this.currentPlayingVideo = event.target;
                this.currentPlayingVideo.play();
            }
        }
    }

    playVideo(videoUrl: string, event) {
        let videoPrams={
            value:event.target,
            url :videoUrl
        }
        this.videoClicked.emit(videoPrams);
    }

    @ViewChild("scrollableDiv") scrollableDiv!: ElementRef;
    @ViewChildren("itemElement") itemElements!: QueryList<ElementRef>;
    detectHiddenSections() {
        const scrollableDivTop =
            this.scrollableDiv.nativeElement.getBoundingClientRect().top;
        const scrollableDivBottom =
            this.scrollableDiv.nativeElement.getBoundingClientRect().bottom;

        this.itemElements.forEach((itemElement) => {
            const itemElementTop =
                itemElement.nativeElement.getBoundingClientRect().top;
            const itemElementBottom =
                itemElement.nativeElement.getBoundingClientRect().bottom;

            if (
                itemElementTop > scrollableDivBottom ||
                itemElementBottom < scrollableDivTop
            ) {
                itemElement.nativeElement.classList.add("hidden");
                console.log("hide");
            } else {
                itemElement.nativeElement.classList.remove("hidden");
                console.log("visible");
            }
        });
    }
}
