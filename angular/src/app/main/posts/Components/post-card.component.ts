import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Injector,
    Input,
    OnChanges,
    OnDestroy,
    Output,
    QueryList,
    SimpleChanges,
    ViewChild,
    ViewChildren,
  } from "@angular/core";
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
    implements OnChanges, AfterViewInit, OnDestroy
  {
    @Input() isCurrentVideo: boolean;
    @Input() post: GetAppPostForViewDto = null;
    @Input() fromMarketplaceProfile: boolean;
  
    @Output() showViewPost = new EventEmitter<GetAppPostForViewDto>();
    @Output() _deletePost = new EventEmitter<GetAppPostForViewDto>();
    @Output() _editPost = new EventEmitter<GetAppPostForViewDto>();
    @Output() _viewEvent = new EventEmitter<number>();
    @Output() videoClicked: EventEmitter<any> = new EventEmitter<any>();
  
    addNewThread: boolean = true;
    linkUrl: string = null;
  
    PostType = PostType;
    profilePicture: string;
    isHost: boolean = false;
    urlPreviewImage: string;
  
    @ViewChild("InteractionsComponent")
    InteractionsComponent: InteractionsComponent;
  
    getAppEntityForViewDto: AppEntitiesRelationshipDto = null;
    appEntityTypes = AppEntityTypes;

    @ViewChild("scrollableDiv") scrollableDiv?: ElementRef;
    @ViewChildren("itemElement") itemElements!: QueryList<ElementRef>;
  

    private _scrollHandler = () => this.detectHiddenSections();
    private _scrollBound = false;
  
    constructor(
      private _postService: AppPostsServiceProxy,
      private _entitiesService: AppEntitiesServiceProxy,
      private _postlist: PostListService,
      injector: Injector
    ) {
      super(injector);
      this.isHost = !this.appSession.tenantId;
    }

    ngOnChanges(changes: SimpleChanges) {
      if (!this.post) return;
  
      if (this.post?.appPost?.profilePictureId) {
        this.getProfilePictureById(this.post.appPost.profilePictureId);
      }
  

      this.linkUrl = this._postlist.onChangeBody(this.post?.appPost?.description);
      this.post.appPost.embeddedLink = this.linkUrl;
  
      if (this.linkUrl && this.post.type === PostType.TEXT) {
        this.urlPreviewImage = this.post.attachmentsURLs?.[0];
      }

      try {
        const post = GetAppPostForViewDto.fromJS(this.post.toJSON());
        this.post = post;
      } catch {
       
      }
  
 
      this.getRelatedEntity();
 
      this.bindScroll();
      setTimeout(() => this.detectHiddenSections());
    }
  
    ngAfterViewInit(): void {
      this.bindScroll();
  

      this.itemElements?.changes?.subscribe(() => {
        setTimeout(() => this.detectHiddenSections());
      });
  
      setTimeout(() => this.detectHiddenSections());
    }
  
    ngOnDestroy() {
    
      if (this._scrollBound && this.scrollableDiv?.nativeElement) {
        this.scrollableDiv.nativeElement.removeEventListener(
          "scroll",
          this._scrollHandler
        );
      }
  
      this.emitDestroy();
    }
  
    // ----------------------------
    // Scroll helpers
    // ----------------------------
    private bindScroll() {
      if (this._scrollBound) return;
      if (!this.scrollableDiv?.nativeElement) return;
  
      this.scrollableDiv.nativeElement.addEventListener(
        "scroll",
        this._scrollHandler
      );
      this._scrollBound = true;
    }
  
    detectHiddenSections() {
      if (!this.scrollableDiv?.nativeElement) return;
      if (!this.itemElements || this.itemElements.length === 0) return;
  
      const rect = this.scrollableDiv.nativeElement.getBoundingClientRect();
      const scrollableDivTop = rect.top;
      const scrollableDivBottom = rect.bottom;
  
      this.itemElements.forEach((itemElement) => {
        const itemRect = itemElement.nativeElement.getBoundingClientRect();
        const itemElementTop = itemRect.top;
        const itemElementBottom = itemRect.bottom;
  
        const isOutside =
          itemElementTop > scrollableDivBottom ||
          itemElementBottom < scrollableDivTop;
  
        if (isOutside) itemElement.nativeElement.classList.add("hidden");
        else itemElement.nativeElement.classList.remove("hidden");
      });
    }
  
    // ----------------------------
    // Data / API
    // ----------------------------
    getProfilePictureById(id: string) {
      const subs = this._postService.getProfilePictureAllByID(id).subscribe((data) => {
        if (data?.profilePicture) {
          this.profilePicture = "data:image/jpeg;base64," + data.profilePicture;
          if (this.post?.appPost) {
            this.post.appPost.profilePictureUrl = this.profilePicture;
          }
        }
      });
      this.subscriptions.push(subs);
    }
  
    getRelatedEntity() {
      if (!this.post?.appPost?.appEntityId) {
        this.getAppEntityForViewDto = null;
        return;
      }
  
      const subs = this._entitiesService
        .getAppEntityRelations(this.post.appPost.appEntityId)
        .subscribe((res) => {
          const indx = res?.appEntity?.entitiesRelationships?.findIndex(
            (x) =>
              x.relatedEntityTypeCode?.toUpperCase() ==
              this.appEntityTypes[this.appEntityTypes.EVENT].toString().toUpperCase()
          );
  
          if (indx >= 0) {
            this.getAppEntityForViewDto = res.appEntity.entitiesRelationships[indx];
          } else {
            this.getAppEntityForViewDto = null;
          }
        });
  
      this.subscriptions.push(subs);
    }
  
    // ----------------------------
    // UI Actions
    // ----------------------------
    onshowViewPost() {
      this.InteractionsComponent?.createView();
      if (this.post?.type == PostType.TEXT) return;
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
      ) {
        this._viewEvent.emit(this.getAppEntityForViewDto.relatedEntityId);
      }
  
      this.InteractionsComponent?.createView();
    }
  
    // ----------------------------
    // Video logic
    // ----------------------------
    currentPlayingVideo: HTMLVideoElement;
  
    onPlayingVideo(event: any) {
      event.preventDefault();
  
      if (this.currentPlayingVideo === undefined) {
        this.currentPlayingVideo = event.target;
        this.currentPlayingVideo.play();
      } else {
        if (event.target !== this.currentPlayingVideo) {
          this.currentPlayingVideo.pause();
          this.currentPlayingVideo = event.target;
          this.currentPlayingVideo.play();
        }
      }
    }
  
    playVideo(videoUrl: string, event: any) {
      const videoPrams = {
        value: event.target,
        url: videoUrl,
      };
      this.videoClicked.emit(videoPrams);
    }

    get visibleImages(): string[] {
        const imgs = this.post?.attachmentsURLs || [];
        return imgs.slice(0, 5);
      }
      
      get remainingCount(): number {
        const total = this.post?.attachmentsURLs?.length || 0;
        return total > 5 ? total - 5 : 0;
      }
      
      // onImgError(e: Event) {
      //   const img = e.target as HTMLImageElement;
      //   img.src = "assets/placeholders/appitem-placeholder.png";
      // }

      isEventPost(): boolean {
        const code = this.getAppEntityForViewDto?.relatedEntityTypeCode;
        const eventCode = this.appEntityTypes?.[this.appEntityTypes.EVENT]?.toString();
        return !!code && !!eventCode && code.toUpperCase() === eventCode.toUpperCase();
      }
      
      // optional: handle logo fallback separately
      onImgError(e: Event, isLogo: boolean = false) {
        const el = e.target as HTMLImageElement;
        el.src = isLogo
          ? 'assets/placeholders/appitem-placeholder.png'
          : 'assets/placeholders/appitem-placeholder.png';
      }
  }