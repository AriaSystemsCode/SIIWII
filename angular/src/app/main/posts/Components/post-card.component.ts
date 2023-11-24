import { Input, OnDestroy, Output, ViewChild } from "@angular/core";
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
    implements OnChanges, OnDestroy
{

    @Input() post: GetAppPostForViewDto = null;
    @Output() showViewPost = new EventEmitter<GetAppPostForViewDto>();
    @Output() _deletePost = new EventEmitter<GetAppPostForViewDto>();
    @Output() _editPost = new EventEmitter<GetAppPostForViewDto>();
    @Output() _viewEvent = new EventEmitter<number>();
    linkUrl: string = null;
    PostType = PostType;
    profilePicture: string;
    isHost: boolean = false;
    urlPreviewImage : string
    @ViewChild('InteractionsComponent') InteractionsComponent : InteractionsComponent
    getAppEntityForViewDto: AppEntitiesRelationshipDto = null;
    appEntityTypes=AppEntityTypes;
    
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

    ngOnChanges(changes: SimpleChanges) {
        if (this.post) {
            //Get ProfilePicture
            this.getProfilePictureById(this.post.appPost.profilePictureId);
            //Get linkUrl
            this.linkUrl = this._postlist.onChangeBody(
                this.post.appPost.description
            );
            this.post.appPost.embeddedLink = this.linkUrl;
            if( this.linkUrl && this.post.type === PostType.TEXT  ){
                this.urlPreviewImage = this.post.attachmentsURLs[0]
            }
        }
        const post = GetAppPostForViewDto.fromJS(this.post.toJSON());
        this.post = post;
        this.getRelatedEntity();
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
        this.InteractionsComponent.createView()
        if(this.post.type == PostType.TEXT) return
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
            this.InteractionsComponent.createView()
    }
}
