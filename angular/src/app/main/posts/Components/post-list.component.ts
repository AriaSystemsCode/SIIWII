import { formatDate } from "@angular/common";
import { Injector, OnDestroy } from "@angular/core";
import { ViewChild } from "@angular/core";
import { Component, OnInit, AfterViewInit } from "@angular/core";
import { FileUploaderCustom } from "@shared/components/import-steps/models/FileUploaderCustom.model";
import { CreateOrEditEventComponent } from "@app/main/AppEvent/Components/create-or-edit-event.component";
import { ViewEventComponent } from "@app/main/AppEvent/Components/view-event.component";
import { ProgressComponent } from "@app/shared/common/progress/progress.component";
import { AppConsts } from "@shared/AppConsts";
import { AppComponentBase } from "@shared/common/app-component-base";
import {
    AppEntitiesServiceProxy,
    AppEntityAttachmentDto,
    AppEventDto,
    AppPostDto,
    AppPostsServiceProxy,
    AttachmentsCategories,
    CreateOrEditAppEventDto,
    CreateOrEditAppPostDto,
    GetAppPostForViewDto,
    PostType,
    ProfileServiceProxy,
} from "@shared/service-proxies/service-proxies";
import { UserClickService } from "@shared/utils/user-click.service";
import { FileUploaderOptions } from "ng2-file-upload";
import { fromEvent } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";
import Swal from "sweetalert2/dist/sweetalert2.js";
import { CreatePostEntryComponent } from "./create-post-entry.component";
import { CreateorEditPostComponent } from "./createor-edit-post.component";
import { ViewPostComponent } from "./view-post.component";

@Component({
    selector: "app-post-list",
    templateUrl: "./post-list.component.html",
    styleUrls: ["./post-list.component.scss"],
})
export class PostListComponent
    extends AppComponentBase
    implements OnInit, AfterViewInit, OnDestroy
{
    @ViewChild("createOrEditModal", { static: true })
    createOrEditModal: CreateorEditPostComponent;
    @ViewChild("createPostEntry", { static: true })
    createPostEntry: CreatePostEntryComponent;
    @ViewChild("viewPostModal", { static: true })
    viewPostModal: ViewPostComponent;
    @ViewChild("createOrEditEventModal", { static: true })
    createOrEditEventModal: CreateOrEditEventComponent;

    /* /////////////////////////////////////////////////////// */
    @ViewChild("viewEventModal", { static: true })
    viewEventModal: ViewEventComponent;
    /* /////////////////////////////////////////////////////// */

    profilePicture: String;
    userName: String;
    typeFile: PostType;
    attachmets: any[] = [];
    attachmentsUploader: FileUploaderCustom;
    filter: string = "";
    codeFilter: string = "";
    descriptionFilter: string = "";
    typeFilter: string = "";
    contactNameFilter: string = "";
    entityNameFilter: string = "";
    skipCount: number = 0;
    maxResultCount: number = 5;
    noOfItemsToShowInitially: number = 5;
    totalCount: number = 0;
    itemsToLoad: number = 5;
    postsToShow:GetAppPostForViewDto[];
    isFullListDisplayed: boolean = false;
    posts: GetAppPostForViewDto[] = [];
    bodyElement;
    createOrEditAppPostDto: CreateOrEditAppPostDto =
        new CreateOrEditAppPostDto();
    AttachmentInfoDto: AppEntityAttachmentDto[] = [];
    relatedEntityId: number = 0;
    fromViewEvent:boolean=false;
    progress: number=0;
    @ViewChild("ProgressModal", { static: true })
    ProgressModal: ProgressComponent;

    

    public constructor(
        private _profileService: ProfileServiceProxy,
        private _postService: AppPostsServiceProxy,
        private _entitiesService: AppEntitiesServiceProxy,
        private userClickService: UserClickService,
        injector: Injector
    ) {
        super(injector);
    }

    
    ngOnInit(): void {
        this.getProfilePicture();
        this.userName =
            this.appSession.user.name + " " + this.appSession.user.surname;
        this.refreshData();

        const subs = this.userClickService.clickSubject$.subscribe((res) => {
            if (res == "Home") {
                this.refreshData();
            }
        });
        this.subscriptions.push(subs);
    }

    ngAfterViewInit() {
        this.bodyElement = document.getElementsByTagName("body");
        if (this.bodyElement) {
            fromEvent(this.bodyElement[0], "scroll")
                .pipe(takeUntil(this.destroy$))
                .subscribe(($event) => {
                    this.onScroll($event);
                });
            this.bodyElement[0].scrollTop = 0;
            this.bodyElement[0].classList.add("thin-scroll");
        }
    }

    ngOnDestroy() {
        this.emitDestroy();
    }

    refreshData() {
        this.posts = [];
        this.AttachmentInfoDto = [];
        this.noOfItemsToShowInitially = 5;
        this.maxResultCount = 5;
        this.skipCount = 0;
        if (this.bodyElement) {
            this.bodyElement[0].scrollTop = 0;
        }
        this.getAllPosts();
    }

    getProfilePicture(): void {
        const subs = this._profileService
            .getProfilePicture()
            .subscribe((result) => {
                if (result && result.profilePicture) {
                    this.profilePicture =
                        "data:image/jpeg;base64," + result.profilePicture;
                }
            });
        this.subscriptions.push(subs);
    }
    onTypeFile($event) {
        this.typeFile = $event;
    }

    onshowCreateOrEdit($event) {
        this.createOrEditModal.show(
            $event,
            this.typeFile,
            this.relatedEntityId
        );
    }

    onCreateOrEditPost($event: GetAppPostForViewDto) {
      
        this.attachmets = $event.attachments;
        if(this.attachmets &&
            this.attachmets.length == 0)
           this.spinnerService.show();

        this.AttachmentInfoDto = [];
        if (
            this.attachmets &&
            this.attachmets.length > 0 &&
            $event.type == PostType.TEXT
        ) {
            const response: any = $event.attachments[0];
            $event.attachments[0] = new AppEntityAttachmentDto();
            $event.attachments[0].guid = response.fileName;
            $event.attachments[0].fileName = response.image;
            $event.attachments[0].attachmentCategoryEnum =
                AttachmentsCategories.IMAGE;
            this.AttachmentInfoDto = $event.attachments;
            this.createOrEditPost($event);
        } else if (
            !($event && $event.appPost.id) &&
            this.relatedEntityId == 0 &&
            this.attachmets &&
            this.attachmets.length > 0 &&
            $event.type != PostType.TEXT
        )
            this.onUploadAttachmets($event);
        else {
            if (this.relatedEntityId > 0)
                this.AttachmentInfoDto = $event.attachments;

            this.createOrEditPost($event);
        }
    }

    onUploadAttachmets($event: GetAppPostForViewDto) {
        var uploadUrl = "/Attachment/UploadFiles";
        this.attachmentsUploader = this.createUploader(uploadUrl);

        this.attachmentsUploader.addToQueue(this.attachmets);
        this.attachmentsUploader.onBuildItemForm = (
            fileItem: any,
            form: any
        ) => {
            this.AttachmentInfoDto = [];
            for (let i = 0; i < this.attachmets.length; i++) {
                var guid = this.guid();
                var _attachmentInfoDto: AppEntityAttachmentDto =
                    new AppEntityAttachmentDto();
                _attachmentInfoDto.guid = guid;
                _attachmentInfoDto.fileName = this.attachmets[i].name;
                // AttachmentInfoDto.attachmentCategoryId = 4;
                if (this.attachmets[i].type.includes("image"))
                    _attachmentInfoDto.attachmentCategoryEnum =
                        AttachmentsCategories.IMAGE;
                else
                    _attachmentInfoDto.attachmentCategoryEnum =
                        AttachmentsCategories.VIDEO;

                this.AttachmentInfoDto.push(_attachmentInfoDto);
                if (this.attachmets.length > 1) form.append("guid" + i, guid);
                else form.append("guid", guid);
            }
        };

        this.attachmentsUploader.onErrorItem = (item, response, status) => {
            this.notify.error(this.l("UploadFailed"));
        };
        this.attachmentsUploader.onSuccessItem = (item, response, status) => {
            this.createOrEditPost($event);
        };
      
        this.attachmentsUploader.uploadAllFiles();
       
            if(this.attachmets.length > 0){
               this.ProgressModal.show();

            this.attachmentsUploader.onProgressAll = (progress:any) => {
               this.progress =Math.round((progress.loaded / progress.total) * 100);
           };

           this.attachmentsUploader.onCompleteItem = () => {
            this.progress = 100;
        };
          }
       

       

    }

    createUploader(
        url: string,
        success?: (result: any) => void
    ): FileUploaderCustom {
        const uploader = new FileUploaderCustom({
            url: AppConsts.remoteServiceBaseUrl + url,
        });

        uploader.onAfterAddingFile = (file) => {
            file.withCredentials = false;
        };

        const uploaderOptions: FileUploaderOptions = {};
        uploaderOptions.authToken = "Bearer " + this.tokenService.getToken();
        uploaderOptions.removeAfterUpload = true;
        uploader.setOptions(uploaderOptions);
        return uploader;
    }

    createOrEditPost($event: GetAppPostForViewDto) {
        this.createOrEditAppPostDto = new CreateOrEditAppPostDto();
        if ($event && $event.appPost.id) {
            this.createOrEditAppPostDto.attachments = $event.attachments;
            this.createOrEditAppPostDto.id = $event.appPost.id;
        } else this.createOrEditAppPostDto.attachments = this.AttachmentInfoDto;
        this.createOrEditAppPostDto.description = $event.appPost.description;
        this.createOrEditAppPostDto.type = $event.type;
        this.createOrEditAppPostDto.urlTitle = $event.urlTitle;
        this.createOrEditAppPostDto.relatedEntityId = this.relatedEntityId;

        const subs = this._postService
            .createOrEdit(this.createOrEditAppPostDto)
            .pipe(
                finalize(() => {
                  if(this.attachmets?.length)
                    this.ProgressModal.hide();
                  else
                    this.spinnerService.hide();

                    this.createOrEditModal.hideModal();
                    this.relatedEntityId = 0;
                })
            )
            .subscribe((result) => {
                if ($event && $event.appPost.id) {
                    this.notify.info(this.l("Editsuccessful"));
                } else {
                    this.posts.unshift(result);
                    this.postsToShow.unshift(result);
                    this.posts = [...this.posts];
                    this.postsToShow = [...this.postsToShow];
                    this.notify.info(this.l("Postsuccessful"));
                }
            });
        this.subscriptions.push(subs);
    }

    loading: boolean;
    getAllPosts() {
        this.loading = true;
        const subs = this._postService
            .getAll(
                this.filter,
                this.codeFilter,
                this.descriptionFilter,
                this.typeFilter,
                this.contactNameFilter,
                this.entityNameFilter,
                0,
                "",
                this.skipCount,
                this.maxResultCount
            )
            .pipe(
                finalize(() => {
                    this.loading = false;
                })
            )
            .subscribe((result) => {
                this.totalCount = result.totalCount;
                for (var i = 0; i < result.items.length; i++) {
                    this.posts.push(result.items[i]);
                }

                this.postsToShow = this.posts.slice(
                    0,
                    this.noOfItemsToShowInitially
                );

                if (
                    this.bodyElement &&
                    this.noOfItemsToShowInitially == 5 &&
                    this.skipCount == 0
                ) {
                    this.bodyElement[0].scrollTop = 0;
                }
            });
        this.subscriptions.push(subs);
    }
    scrollIntoTop($event, currentPos) {
        $event.target.scroll(0, currentPos);
    }
    onScroll($event): void {
        if (this.loading) return;
        const currentPos = $event.target.scrollTop;
        const elementTotalHeight =
            $event.target.scrollHeight - $event.target.offsetHeight;

        if (elementTotalHeight - currentPos > 300) return;

        this.scrollIntoTop($event, currentPos);

        if (this.noOfItemsToShowInitially < this.totalCount) {
            this.maxResultCount = this.itemsToLoad;
            this.skipCount = this.noOfItemsToShowInitially;
            this.noOfItemsToShowInitially += this.itemsToLoad;
            this.getAllPosts();
        } else {
            this.isFullListDisplayed = true;
        }
    }
    onshowViewPost($event) {
        this.viewPostModal.show($event);
    }

    ondeletePost($event: GetAppPostForViewDto, index: number) {
        Swal.fire({
            title: "Remove this post",
            text: "Are you sure you want to permanently remove this post?",
            showCancelButton: true,
            cancelButtonText: "No",
            imageUrl: "../assets/posts/deletePost.svg",
            imageWidth: 70,
            imageHeight: 70,
            confirmButtonText: "Yes",
            allowOutsideClick: false,
            allowEscapeKey: false,
            backdrop: true,
            customClass: {
                confirmButton: "swal-btn swal-confirm",
                cancelButton: "swal-btn",
                title: "swal-title",
            },
        }).then((result) => {
            if (result.isConfirmed) {
                const subs = this._postService
                    .delete($event.appPost.id)
                    .subscribe((result) => {
                        this.posts.splice(index, 1);
                        this.postsToShow.splice(index, 1);
                        this.posts = [...this.posts];
                        this.postsToShow = [...this.postsToShow];
                        this.notify.info("Post successfully deleted.");
                    });
                this.subscriptions.push(subs);
            }
        });
    }
    onshowCreateOrEditEvent($event) {
        if ($event) this.createOrEditEventModal.show(0, true);
    }

    oncreatePostEvent($event: any,fromViewEvent:boolean) {
        this.fromViewEvent=fromViewEvent;
        var getAppPostForViewDto: GetAppPostForViewDto =
            new GetAppPostForViewDto();
        getAppPostForViewDto.type = PostType.SINGLEIMAGE;
        this.typeFile = PostType.SINGLEIMAGE;
        getAppPostForViewDto.appPost = new AppPostDto();

        var eventType = "";
        if ($event.isOnLine) eventType = "Online";
        else eventType = "in Person";

        var userName = "";
        if ($event.userName) userName = $event.userName;
        else userName = this.userName.toString();

        getAppPostForViewDto.appPost.description =
            $event.name +
            "\n" +
            "Event by " +
            userName +
            "\n" +
            eventType +
            "\n" +
            $event.fromDate.format("MMM D ,Y").toString() +
            " , " +
            $event.fromTime.format("HH:mm").toString() +
            " - " +
            $event.toDate.format("MMM D ,Y").toString() +
            " , " +
            $event.toTime.format("HH:mm").toString();

        this.relatedEntityId = $event.entityId;
        this._entitiesService
            .getAppEntityAttachmentsWithPaging(
                $event.entityId,
                undefined,
                undefined,
                undefined
            )
            .subscribe((result) => {
                getAppPostForViewDto.attachments = result.items;
                this.onshowCreateOrEdit(getAppPostForViewDto);
            });
    }

    onshowViewEvent($event: number) {
        this.viewEventModal.show($event, 0);
    }

    onshowViewEventFromPost($event: number) {
        this.viewEventModal.show(0, $event);
    }

    showEventModal($event: boolean) {
        if (this.fromViewEvent) this.viewEventModal.showModal();
        this.fromViewEvent=false;
        this.relatedEntityId=0;
    }

    /* /////////////////////////////////////////////////////// */

    showPost(postid: number) {

        // reterive the post by postId
        this._postService
          .getAll("", "", "", "", "", "", postid, "", 0, 1)
          .subscribe((res) => {
            if (res.items.length > 0) {
              if (res.items[0].type == PostType.TEXT)
              {
                window.open(this.GetLinkUrl(res.items[0].appPost.description), "_blank");
              }
              else
              {
              this.viewPostModal.show(res.items[0]);
              }
            }
          });
      }

      GetLinkUrl(textToCheck: string): string {
        let linkUrl = null;
        let hasLink = false;

        if (textToCheck) {
            /* var expression =
                /(https?:\/\/)?[\w\-~]+(\.[\w\-~]+)+(\/[\w\-~@:%]*)*(#[\w\-]*)?(\?[^\s]*)?/gi; */
            var expression =
                /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
            var regex = new RegExp(expression);
            var match;
            var splitText = [];
            var startIndex = 0;
            // while ((match = regex.exec(textToCheck)) != null) {
            //     splitText.push({
            //         text: textToCheck.substr(
            //             startIndex,
            //             match.index - startIndex
            //         ),
            //         type: "text",
            //     });

            //     var cleanedLink = textToCheck.substr(
            //         match.index,
            //         match[0].length
            //     );
            //     splitText.push({ text: cleanedLink, type: "link" });

            //     startIndex = match.index + match[0].length;
            // }
            // if (startIndex < textToCheck.length)
            //     splitText.push({
            //         text: textToCheck.substr(startIndex),
            //         type: "text",
            //     });
            // var indx = splitText.findIndex((x) => x.type == "link");

            // if (indx >= 0) {
            //     var video_id = splitText[indx].text.includes("v=")
            //         ? splitText[indx].text.split("v=")[1].split("&")[0]
            //         : null;
            //     linkUrl = video_id
            //         ? "//www.youtube.com/embed/" + video_id
            //         : splitText[indx].text;
            //     hasLink = true;
            // }
            const matchedUrls  = textToCheck.match(regex);
            if(matchedUrls !=null && matchedUrls?.length > 0)  linkUrl = matchedUrls[matchedUrls.length-1]
        }

        return linkUrl;
    }
}
