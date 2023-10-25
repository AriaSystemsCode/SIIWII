import { Output, ViewChild } from "@angular/core";
import { Component, OnInit } from "@angular/core";
import { ModalDirective } from "ngx-bootstrap/modal";
import { ElementRef } from "@angular/core";
import Swal from "sweetalert2";
import { AppComponentBase } from "@shared/common/app-component-base";
import { Injector } from "@angular/core";
import { Input } from "@angular/core";
import { EventEmitter } from "@angular/core";
import {
    AppPostDto,
    AppPostsServiceProxy,
    GetAppPostForViewDto,
    PostType,
} from "@shared/service-proxies/service-proxies";
import { PostListService } from "../Services/post-list.service";
import { debounceTime, distinctUntilChanged, finalize } from "rxjs/operators";
import { Observable, Subject, Subscription } from "rxjs";

@Component({
    selector: "app-createor-edit-post",

    templateUrl: "./createor-edit-post.component.html",
    styleUrls: ["./createor-edit-post.component.scss"],
})
export class CreateorEditPostComponent
    extends AppComponentBase
    implements OnInit
{
    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
    @ViewChild("imageInput") imageInput: ElementRef;
    @ViewChild("videoInput") videoInput: ElementRef;
    @ViewChild("newsInput") newsInput: ElementRef;
    @ViewChild("image1") image1: ElementRef;
    @ViewChild("image2") image2: ElementRef;
    @ViewChild("image3") image3: ElementRef;
    @ViewChild("image4") image4: ElementRef;
    @ViewChild("image5") image5: ElementRef;
    @Input() profilePicture: string;
    @Input() userName: string = "";
    @Output() type = new EventEmitter<PostType>();
    @Output() closeModal = new EventEmitter<boolean>();
    @Output() createorEditPost = new EventEmitter<GetAppPostForViewDto>();
    words: number = 0;
    seeMessage: boolean = false;
    linkUrl = null;
    hasLink: boolean = false;
    image1Right: number = 0;
    image2Right: number = 0;
    image3Right: number = 0;
    image4Right: number = 0;
    image5Right: number = 0;
    loading: boolean = false;
    showDeleteIcon: boolean = false;
    header: string = "";
    showAttachmentsIcons: boolean = true;
    post: GetAppPostForViewDto;
    postBody: string = "";
    attachmets: any[] = [];
    urlTitle: string;
    attachmetsSrc: string[] = [];
    PostType = PostType;
    typeFile: PostType;
    typeFilePassed: PostType;
    uploadImage: boolean;
    uploadVideo: boolean;
    videoUrl;
    editMode: boolean;
    relatedEntityId: number = 0;
    acceptVideoType: string = "MP4";
    acceptVideoSize: number = 200000000;
    acceptVideoDuration: number = 10;
    acceptImageCount: number = 5;
    acceptBodyCharacters: number = 1300;
    constructor(
        private _appPostsServiceProxy: AppPostsServiceProxy,
        private _postlist: PostListService,
        injector: Injector
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.uploadImage = true;
        this.uploadVideo = true;
    }

    show(
        getAppPostForViewDto: GetAppPostForViewDto,
        typeFile?: PostType,
        relatedEntityId?: number
    ) {

        this.typeFilePassed = typeFile;
        if(!relatedEntityId)
      this.relatedEntityId =0;
      else
        this.relatedEntityId = relatedEntityId;

        this.post = getAppPostForViewDto;
        if (this?.post?.appPost?.id) {
            // edit mode
            this.editMode = true;
            this.header = "Editpost";
            this.profilePicture = this.post.appPost.profilePictureUrl;
            this.userName = this.post.appPost.userName;
            this.postBody = this.post.appPost.description;
            this.attachmets = this.post.attachmentsURLs
                ? this.post.attachmentsURLs
                : [];
            this.attachmetsSrc = this.post.attachmentsURLs
                ? this.post.attachmentsURLs
                : [];
            this.typeFile = this.post.type;
            if (this.typeFile == this.PostType.SINGLEVIDEO || this.typeFile == PostType.NEWSDIGEST)
                this.videoUrl = this.attachmets[0];
            this.showAttachmentsIcons = false;

            this.linkUrl = this.post.appPost.embeddedLink;
            if (this.linkUrl) this.hasLink = true;
            if (this.post.type == PostType.TEXT) {
                this.attachmentFolderName = "attachments";
                this.urlPreviewImage = this.post.attachmentsURLs[0];
                this.urlTitle = this.post.urlTitle;
            }
        } else {
            // create mode
            this.editMode = false;
            this.header = "Createapost";

            if (this.relatedEntityId > 0) {
                this.showAttachmentsIcons = false;
                this.typeFile = this.post.type;
                this.postBody = this.post.appPost.description;

                this.attachmets = this.post.attachments;
                if (this.post.attachments && this.post.attachments.length > 0) {
                    this.post.attachments.forEach((attach) => {
                        this.attachmetsSrc.push(attach.url);
                    });
                } else {
                    this.attachmets = [];
                    this.attachmetsSrc = [];
                }
            } else this.showAttachmentsIcons = true;
        }
        this.words = this.postBody
            ? this.acceptBodyCharacters - this.postBody.length
            : this.acceptBodyCharacters;
        this.modal.show();
        if (
            typeFile != null &&
            (!this.relatedEntityId || this.relatedEntityId == 0)
        )
            this.uploadFiles(typeFile);
        this.listenToTextChange();
    }

    uploadFiles(typeFile: PostType) {
        if (typeFile == PostType.SINGLEIMAGE) {
            if (!this.seeMessage) {
                Swal.fire({
                    title: "",
                    text: "You can upload up to " +
                    this.acceptImageCount +
                    " images",
                    icon: "info",
                    customClass: {
                        popup: 'popup-class',
                        icon: 'icon-class',
                        content: 'content-class',
                        actions: 'actions-class',
                        confirmButton: 'confirm-button-class',
                    },
                })
                .then((x) => {
                    this.seeMessage = true;
                    this.imageInput.nativeElement.click();
                });
            } else this.imageInput.nativeElement.click();
        } else if (typeFile == PostType.SINGLEVIDEO)
            {this.videoInput.nativeElement.click();}
            else if ( typeFile == PostType.NEWSDIGEST)
            {this.newsInput.nativeElement.click();}
    }

    fileChangeEvent($event, typeFile: PostType) {
        if (this.typeFile == PostType.TEXT && this.attachmets.length > 0) {
            this.attachmets = [];
            this.linkUrl = false;
            this.hasLink = false;
        }
        this.typeFile = typeFile;
        if ($event.target.files.length > 0) {
            this.validateAttachmets($event.target.files);
            if (this.attachmets.length > 0) {
                this.linkUrl = null;
                this.hasLink = false;
            }
        }
    }

    calculateImagesPos($event: any, index: number) {
        var parentElement = this.image1.nativeElement;
        var fullWidth = parentElement.offsetWidth;
        var attachmentImageWidth = parentElement.children[0].offsetWidth;
        this.image1Right = Math.abs((fullWidth - attachmentImageWidth) / 2);

        if (index > 1) {
            var parentElement = this.image2.nativeElement;
            var fullWidth = parentElement.offsetWidth;
            var attachmentImageWidth = parentElement.children[0].offsetWidth;
            this.image2Right = Math.abs((fullWidth - attachmentImageWidth) / 2);
        }
        if (index > 2) {
            var parentElement = this.image3.nativeElement;
            var fullWidth = parentElement.offsetWidth;
            var attachmentImageWidth = parentElement.children[0].offsetWidth;
            this.image3Right = Math.abs((fullWidth - attachmentImageWidth) / 2);
        }
        if (index > 3) {
            var parentElement = this.image4.nativeElement;
            var fullWidth = parentElement.offsetWidth;
            var attachmentImageWidth = parentElement.children[0].offsetWidth;
            this.image4Right = Math.abs((fullWidth - attachmentImageWidth) / 2);
        }
        if (index > 4) {
            var parentElement = this.image5.nativeElement;
            var fullWidth = parentElement.offsetWidth;
            var attachmentImageWidth = parentElement.children[0].offsetWidth;
            this.image5Right = Math.abs((fullWidth - attachmentImageWidth) / 2);
        }
    }

    validateAttachmets(files: any) {
        if (this.typeFile == PostType.SINGLEVIDEO || this.typeFile == PostType.NEWSDIGEST) {
            this.videoUrl = null;
            this.attachmets = [];
            this.uploadVideo = true;
            this.uploadImage = true;
            //Format MP4
            var formatCond: boolean =
                files[0].type
                    .toUpperCase()
                    .substr(files[0].type.indexOf("/") + 1) !=
                this.acceptVideoType;
            if (formatCond) {
                Swal.fire({
                    title: "",
                    text: "Video Format should be MP4." ,
                    icon: "info",
                    customClass: {
                        popup: 'popup-class',
                        icon: 'icon-class',
                        content: 'content-class',
                        actions: 'actions-class',
                        confirmButton: 'confirm-button-class',
                    },
                });
                return;
            }

            // 200MB > Size > 75KB
            var sizeCond: boolean = files[0].size >= this.acceptVideoSize;
            if (sizeCond) {
                Swal.fire({
                    title: "",
                    text:  "Maximum Video Size Exceeded - (Not more than 200 MB)" ,
                    icon: "info",
                    customClass: {
                        popup: 'popup-class',
                        icon: 'icon-class',
                        content: 'content-class',
                        actions: 'actions-class',
                        confirmButton: 'confirm-button-class',
                    },
                });

                return;
            }
            this.uploadImage = false;
            this.uploadVideo = false;
            this.attachmets.push(files[0]);
            this.videoUrl = URL.createObjectURL(files[0]);
        } else if (this.typeFile == PostType.SINGLEIMAGE) {
            let length = files.length;
            files = [...files].filter((s) => s.type.includes("image"));

            if (this.attachmets.length + files.length > this.acceptImageCount) {
                Swal.fire({
                    title: "",
                    text:  "Maximum Uploaded images Exceeded - (Not more than " +
                    this.acceptImageCount +
                    " images)" ,
                    icon: "error",
                    customClass: {
                        popup: 'popup-class',
                        icon: 'icon-class',
                        content: 'content-class',
                        actions: 'actions-class',
                        confirmButton: 'confirm-button-class',
                    },
                });
            } else {
                if (
                    this.attachmets.length + files.length ==
                    this.acceptImageCount
                )
                    this.uploadImage = false;
                else this.uploadImage = true;

                for (let i = 0; i < files.length; i++) {
                    var image = files[i];
                    this.attachmets.push(image);
                    const reader = new FileReader();
                    reader.readAsDataURL(image);
                    reader.onload = ($event) => {
                        const _img = new Image();
                        _img.src = reader.result as string;
                        this.attachmetsSrc.push(_img.src);
                        this.attachmetsSrc = [...this.attachmetsSrc];
                    };
                }

                if (length != files.length) {
                    Swal.fire({
                        title: "",
                        text:   "Attached file(s) appears to be not image and cannot be attached.",
                        icon: "info",
                        customClass: {
                            popup: 'popup-class',
                            icon: 'icon-class',
                            content: 'content-class',
                            actions: 'actions-class',
                            confirmButton: 'confirm-button-class',
                        },
                    });
                }
                if (this.attachmets.length > 0) this.uploadVideo = false;
                else this.uploadVideo = true;
            }
        }
    }

    getDuration(event: any) {
        if (event.target.duration / 60 > this.acceptVideoDuration) {
            Swal.fire({
                title: "",
                text:   "Maximum Video Length Exceeded - (Not more than " +
                this.acceptVideoDuration +
                " minutes)",
                icon: "info",
                customClass: {
                    popup: 'popup-class',
                    icon: 'icon-class',
                    content: 'content-class',
                    actions: 'actions-class',
                    confirmButton: 'confirm-button-class',
                },
            });
            this.attachmets = [];
            this.attachmetsSrc = [];
            this.videoUrl = null;
            this.uploadVideo = true;
            this.uploadImage = true;
        }
    }
    textChanged: Subject<string> = new Subject<string>();
    textChanged$: Observable<string> = this.textChanged.asObservable();
    textChangedSubs: Subscription;

    listenToTextChange() {
        this.textChangedSubs = this.textChanged$
            .pipe(distinctUntilChanged(), debounceTime(1000))
            .subscribe((text) => {
                this.checkTextForUrlPreview(text);
            });
    }
    onChangeBody($event) {
        this.textChanged.next($event.target.value);
        var textarea = $event.target
        var heightLimit = 200; /* Maximum height: 200px */
        textarea.style.height = ""; /* Reset the height*/
        textarea.style.height = Math.min(textarea.scrollHeight, heightLimit) + "px";
    }
    checkTextForUrlPreview(textToCheck: string) {
        if (this.typeFile == undefined) {
            this.typeFile = PostType.TEXT;
        }
        this.words = this.postBody
            ? this.acceptBodyCharacters - this.postBody.length
            : this.acceptBodyCharacters;
        if (this.typeFile === PostType.TEXT) {
            const lastLinkUrl = this.linkUrl
            this.linkUrl = this._postlist.onChangeBody(textToCheck);
            this.hasLink = this.linkUrl ? true : false;
            if (lastLinkUrl === this.linkUrl) return;

            if (this.hasLink) {
                this.previewLink(this.linkUrl);
                this.loading = true;
            } else {
                this.urlPreviewImage = undefined;
                this.urlTitle = undefined;
                this.attachmets = [];
            }
        }
    }
    urlPreviewImage: string;
    previewLink(url: string) {
        
        this._appPostsServiceProxy.preview(url)
            .pipe(finalize(() => (this.loading = false)))
            .subscribe(
                (res) => {
                    this.urlPreviewImage = res.image
                    this.attachmets = [];
                    this.attachmets[0] = res;
                    this.urlTitle = res.title;
                },
                (err) => {
                    this.urlPreviewImage = undefined;
                    this.urlTitle = undefined;
                    this.attachmets = [];
                }
            );
    }
    removeLinkPreviewHandler() {
        this.urlPreviewImage = undefined;
        this.urlTitle = undefined;
        this.attachmets = [];
    }
    content_finished_loading() {
        this.loading = false;
        this.showDeleteIcon = true;
    }
    createOrEditPost() {
        // attachments.length = 1 && posttype = 0 => new url not saved yet
        // attachmentsurls = 1 && posttype = 0 => old  saved url
        if (!(this.post && this.post.appPost.id)) {
            //Upload Attachments
            this.post = new GetAppPostForViewDto();
            this.post.appPost = new AppPostDto();
            this.post.attachments = this.attachmets;
            this.post.type = this.typeFile;
            this.post.urlTitle = this.urlTitle;
            this.type.emit(this.typeFile);
        } else {
            if (this.post.type == PostType.TEXT && this.attachmets.length > 0) {
                this.post.urlTitle = this.urlTitle;
                this.post.attachments = this.attachmets;
            }
        }
        this.post.appPost.description = this.postBody;

        this.createorEditPost.emit(this.post);
    }
    attachmentFolderName: string = "tempattachments";
    askToClose() {
        var title = "";
        var showConfirmation = true;

        if (this.post && this.post.appPost.id) {
            if (this.postBody == this.post.appPost.description)
                showConfirmation = false;
            title =
                "You have unsaved changes. Changes you made will not be saved.";
        } else {
            title = "Are you sure you want to discard this new post?";

            if (!(this.postBody.trim() || this.attachmets.length > 0))
                showConfirmation = false;
        }
        if (showConfirmation) {
            var isConfirmed: Observable<boolean>;
    isConfirmed   = this.askToConfirm("",title,
    {
        confirmButtonText: this.l("Yes"),
        cancelButtonText: this.l("No"),
    });

   isConfirmed.subscribe((res)=>{
      if(res){
                        this.hideModal();
                    }
                }
            );
        } else this.hideModal();
    }

    hideModal() {
        this.textChangedSubs?.unsubscribe();
        this.seeMessage = false;
        this.uploadImage = true;
        this.uploadVideo = true;
        this.attachmets = [];
        this.attachmetsSrc = [];
        this.linkUrl = null;
        this.hasLink = false;
        this.PostType = PostType;
        this.typeFile = PostType.TEXT
        this.videoUrl = null;
        this.postBody = "";
        this.typeFile = PostType.TEXT
        this.words = this.acceptBodyCharacters;
        this.image1Right = 0;
        this.image2Right = 0;
        this.image3Right = 0;
        this.image4Right = 0;
        this.image5Right = 0;
        this.loading = false;
        this.showDeleteIcon = false;
        if (this.imageInput && this.videoInput) {
            this.imageInput.nativeElement.value = "";
            this.videoInput.nativeElement.value = "";
        }
        this.urlPreviewImage = undefined;
        this.urlTitle = undefined;
        this.post = Object.assign(new GetAppPostForViewDto(), {
            appPost: new AppPostDto(),
            attachmets: [],
            attachmentsURLs: [],
        });
        this.type.emit(null);
        this.closeModal.emit(true);
        this.relatedEntityId =0;
        this.modal.hide();
    }
    deleteAttachment(index?: number) {
        if (index >= 0) {
            this.attachmets.splice(index, 1);
            this.attachmetsSrc.splice(index, 1);
            if (this.attachmets.length == 0) {
                this.uploadImage = true;
                this.uploadVideo = true;
                this.videoUrl = null;
                this.imageInput.nativeElement.value = "";
                this.videoInput.nativeElement.value = "";
            } else if (this.typeFile == PostType.SINGLEIMAGE)
                this.uploadImage = true;
            this.PostType = PostType;
        } else {
            //Remove Iframe
            this.linkUrl = null;
            this.hasLink = false;
            this.uploadImage = true;
            this.uploadVideo = true;
            this.loading = true;
            this.showDeleteIcon = false;
        }
        if (this.attachmetsSrc.length === 0) {
            this.typeFile = PostType.TEXT;
        }
    }

    hide() {
        this.modal.hide();
    }
}
