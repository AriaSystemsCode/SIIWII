import { Component, EventEmitter, Injector, Output, ViewChild ,Input} from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CreateMessageInput, GetMessagesForViewDto,   MesasgeObjectType,   MessageServiceProxy } from '@shared/service-proxies/service-proxies';
import { AddCommentComponent } from '../../../comments/components/add-comment/add-comment.component';

@Component({
    selector: 'app-comment-parent',
    templateUrl: './comment-parent.component.html',
    styleUrls: ['./comment-parent.component.scss']
})
export class CommentParentComponent extends AppComponentBase {
    @ViewChild("AddCommentComponent") addCommentComponent: AddCommentComponent
    @Output() newCommentAdded : EventEmitter<any> = new EventEmitter<any>()
    @Input() cartStyle: boolean;

    active : boolean = true
    comments : GetMessagesForViewDto[] = []
    skipCount : number = 0
    maxResultCount : number = 5
    totalCount : number
    entityId : number
    parentId : number
    threadId : number
    creatorUserId : number
    constructor(
        private _messageServiceProxy : MessageServiceProxy,
        private _injector : Injector
        ) {
            super(_injector)
        }

    show(creatorUserId:number,entityId:number,parentId?:number,threadId?:number){
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
        comment.mesasgeObjectType = MesasgeObjectType.Comment
        this.addCommentComponent.show(comment)
    }

    focusAddComment(){
        this.addCommentComponent.focusCommentTextArea()
    }
    getAllComments(){
        this._messageServiceProxy.getAllComments(
            undefined,
            undefined,
            undefined,
            undefined,
            this.entityId,
            this.parentId,
            undefined,"UPDATEMESSAGE",
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
    }
}
