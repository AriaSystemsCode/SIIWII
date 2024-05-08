import { Component, EventEmitter, Injector, Output, ViewChild ,Input,AfterViewInit} from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CreateMessageInput, GetMessagesForViewDto,   MesasgeObjectType,   MessageServiceProxy } from '@shared/service-proxies/service-proxies';
import { AddCommentComponent } from '../../../comments/components/add-comment/add-comment.component';
import { BlockList } from 'net';
import { SendMessageModalComponent } from '@app/main/Messages/SendMessage-Modal.Component';
import * as moment from "moment";

@Component({
    selector: 'app-comment-parent',
    templateUrl: './comment-parent.component.html',
    styleUrls: ['./comment-parent.component.scss']
})
export class CommentParentComponent extends AppComponentBase implements AfterViewInit{
    @ViewChild("AddCommentComponent") addCommentComponent: AddCommentComponent
    @ViewChild("SendMessageModalComponent") SendMessageModalComponent: SendMessageModalComponent

    @Output() newCommentAdded : EventEmitter<any> = new EventEmitter<any>()
    @Input() cartStyle: boolean;
    @Input() addNewThread:boolean;
    @Input() commentType:any;

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
    constructor(
        private _messageServiceProxy : MessageServiceProxy,
        private _injector : Injector
        ) {
            super(_injector)
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

    show(creatorUserId:number,entityId:number,parentId?:number,threadId?:number){
        this.comments=[];
        this.totalCount=0;
        this.creatorUserId = creatorUserId
        this.entityId = entityId
        if(parentId) this.parentId = parentId
        if(threadId) this.threadId = threadId
     if(this.comments.length === 0){
            this.getAllComments()
        }
        this.showAddComment()
        this.focusAddComment()
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
    getAllComments(){
        this._messageServiceProxy.getAllComments(
            undefined,
            undefined,
            undefined,
            undefined,
            this.entityId,
            this.parentId,
            undefined,"MESSAGE",
            undefined,
            this.skipCount,
            this.maxResultCount)
        .subscribe((res)=>{
            if(!res) return
            this.skipCount += this.maxResultCount
            this.totalCount = res.totalCount
            this.comments.push(...res.items)
        })
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
}
