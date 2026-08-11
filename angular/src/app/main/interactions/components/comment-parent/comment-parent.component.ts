import { Component, EventEmitter, Injector, Output, ViewChild ,Input,AfterViewInit, ChangeDetectorRef} from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CreateMessageInput, GetMessagesForViewDto,   MesasgeObjectType,   MessageServiceProxy } from '@shared/service-proxies/service-proxies';
import { AddCommentComponent } from '../../../comments/components/add-comment/add-comment.component';
import { SendMessageModalComponent } from '@app/main/Messages/SendMessage-Modal.Component';
import { finalize } from 'rxjs/operators';
@Component({
    selector: 'app-comment-parent',
    templateUrl: './comment-parent.component.html',
    styleUrls: ['./comment-parent.component.scss'],
})
export class CommentParentComponent extends AppComponentBase implements AfterViewInit{
    @ViewChild("AddCommentComponent") addCommentComponent: AddCommentComponent
    @ViewChild("SendMessageModalComponent") SendMessageModalComponent: SendMessageModalComponent

    @Output() newCommentAdded : EventEmitter<any> = new EventEmitter<any>()
    @Output() refreshComments : EventEmitter<boolean> = new EventEmitter<boolean>()
    @Input() cartStyle: boolean;
    @Input() addNewThread:boolean;
    @Input() commentType:any;
    @Input() fromTrans:boolean = false;
    @Input()messageObjectType: 'MESSAGE' | 'THREAD' | 'MENTION' = 'MESSAGE';
    @Input() toName:string = '';


    active : boolean = true;
    showDirectMessageComp:boolean=false;
    showCommentToggle:boolean=false;
    comments : GetMessagesForViewDto[] = []
    skipCount : number = 0
    maxResultCount : number = 5
    totalCount : number
    entityId : number
    parentId : number
    threadId : number
    creatorUserId : number;
    displayDeleteMessage:boolean=false;
    showRegularComment:boolean=true;
    @Input() fromOverview:boolean=false;
  addReplyScreen: boolean ;
    currentComment: any;
@Input() loadComments: boolean = true;
private isLoadingComments = false;
isArabic :boolean = false;
    constructor(
        private _messageServiceProxy : MessageServiceProxy,
        private _injector : Injector,
        private cdr: ChangeDetectorRef
        ) {
            super(_injector)

         }

         ngOnInit(){
                this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName')
    this.currentLang == 'ar' || this.currentLang == 'ar-EG' ? this.isArabic = true : this.isArabic = false
         }
         ngAfterViewInit(): void {
            this.toggleMessageType(this.commentType=='MESSAGE'?2:1)

        }

         toggleMessageType(type:number){
            type==1?this.showRegularComment=true:this.showRegularComment=false;
         }         
        saveNewDirectMsg(){

            this._messageServiceProxy
            .getAll(
                '',
                '',
                '',
                1,
                0,
                this.entityId,
                this.parentId,
                "MESSAGE",
                "",
                this.skipCount,
                this.maxResultCount
            )
            .subscribe((result) => {
            });
        }

        reset(){
            this.comments=[];
            this.totalCount=0;
            this.skipCount= 0
            this.maxResultCount= 5
        }
        
 
   show(
  creatorUserId: number,
  entityId: number,
  parentId?: number,
  threadId?: number
): void {
  this.reset();

  this.creatorUserId = creatorUserId;
  this.entityId = entityId;
  this.parentId = parentId;
  this.threadId = threadId;

  if (this.loadComments) {
    this.getAllComments();
  }

  this.showAddComment();
  this.focusAddComment();
}
    showAddComment(){
        const comment = new CreateMessageInput();
        comment.relatedEntityId = this.entityId;
        if(this.parentId) {
            comment.parentId = this.parentId
            comment.threadId = this.threadId
        }
        comment.to = this.creatorUserId?.toString()
        comment.senderId = this.appSession?.user?.id
        comment.mesasgeObjectType = MesasgeObjectType.Comment;
        this.showCommentToggle=true;
        if(this.commentType!=='MESSAGE')this.addCommentComponent.show(comment)
    }

    focusAddComment(){
 
        if(this.showRegularComment){
            this.addCommentComponent.focusCommentTextArea()
        }else{
            this.showDirectMessageComp=true;
        }
    }
 getAllComments(): void {
  if (this.isLoadingComments || !this.entityId) return;

  this.isLoadingComments = true;
  this.showMainSpinner();

  this._messageServiceProxy
    .getAllComments(
      undefined,
      undefined,
      undefined,
      undefined,
      this.entityId,
      this.parentId,
      undefined,
      'MESSAGE',
      undefined,
      this.skipCount,
      this.maxResultCount
    )
    .pipe(
      finalize(() => {
        this.isLoadingComments = false;
        this.hideMainSpinner();
      })
    )
    .subscribe((res) => {
      if (!res) return;

      this.skipCount += this.maxResultCount;
      this.totalCount = res.totalCount;
      this.comments = [...this.comments, ...res.items];

      this.cdr.detectChanges();
    });
}
    newCommentAddedHandler($event?:GetMessagesForViewDto){
        this.newCommentAdded.emit()
        if($event)this.comments.unshift($event)
    }
    hide(){
        this.active = false
        this.addCommentComponent.active = false
        this.showDirectMessageComp=false;

    }
    getName(event){
      
 this.toName = event
 this.cdr.detectChanges();
//  this.setToName(event)
    }
    getReply(event){
        // this.addReplyScreen = event
        this.cdr.detectChanges();
    }
    getMyCom(event){
      
        this.addReplyScreen = true
        if(event){
            this.addCommentComponent.focusCommentTextArea()
          
            this.currentComment = event
            this.cdr.detectChanges();
        }
    
    }
  
    refreshAfterSave(event){
      
        if(event){
            this.refreshComments.emit(true)
        }
        
           }




    openReplyScreen(comment: any): void {

        this.currentComment = comment

    }

}
