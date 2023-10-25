import {
    Component,
    OnInit,
    ViewChild,
    ElementRef,
    Injector,
} from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import {
    AppPostsServiceProxy,
    GetAppPostForViewDto,
    PostType,
    ProfileServiceProxy,
} from "@shared/service-proxies/service-proxies";
import { ModalDirective } from "ngx-bootstrap/modal";
import { PostListService } from "../Services/post-list.service";

@Component({
    selector: "app-view-post",
    templateUrl: "./view-post.component.html",
    styleUrls: ["./view-post.component.scss"],
})
export class ViewPostComponent extends AppComponentBase {
    constructor(private _injector: Injector,
        private _profileService: ProfileServiceProxy,
        private _postService: AppPostsServiceProxy
    ) {
        super(_injector);
    }
    @ViewChild("viewPostModal", { static: true }) modal: ModalDirective;
    profilePicture: string;
    linkUrl = null;
    post: GetAppPostForViewDto = null;
    PostType = PostType;
    seeMore: boolean = false;
    maxCharLength: number = 690;

    isHost: boolean;
    show(post: GetAppPostForViewDto) {
        this.isHost = Boolean(this.appSession?.tenant?.id);
        this.post = post;
        if (!this.post?.appPost?.profilePictureUrl) {
            this._profileService.getProfilePictureById(this.post?.appPost?.profilePictureId)
                .subscribe(
                    (data) => {
                        if (data.profilePicture) {
                            this.profilePicture = 'data:image/jpeg;base64,' + data.profilePicture;
                        }

                        else {
                            this._postService.getProfilePictureAllByID(this.post?.appPost?.profilePictureId)
                                .subscribe(
                                    (data) => {
                                        if (data.profilePicture) {
                                            this.profilePicture = 'data:image/jpeg;base64,' + data.profilePicture;
                                        }
                                    });
                        }
                    });
        }
        else
            this.profilePicture = this.post?.appPost?.profilePictureUrl;

        console.log(">> profile", this.post.appPost);
        this.linkUrl = this.post.appPost.embeddedLink;
        this.seeMore =
            this.post.appPost.description.length > this.maxCharLength;
        this.modal.show();
    }

    setSeeMore() {
        this.seeMore = false;
    }

    hide() {
        this.seeMore = false;
        this.modal.hide();
        this.pauseVideo()
    }

    @ViewChild("myVideo", { static: false }) myVideo: ElementRef;

    pauseVideo() {
        const videoElement: HTMLVideoElement = this.myVideo.nativeElement;
        if (!videoElement.paused) {
            videoElement.pause();
        }
    }
}
