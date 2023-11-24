import { Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CommentParentComponent } from '@app/main/interactions/components/comment-parent/comment-parent.component';
import { Reactions } from '@app/main/reactions/models/Reactions.enum';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppEntitiesServiceProxy, AppEntityUserReactionDto, AppEntityUserReactionsCountDto } from '@shared/service-proxies/service-proxies';
import { Subscription } from 'rxjs';
import { ReactionsService } from '../services/reactions.service';

@Component({
    selector: 'app-interactions',
    templateUrl: './interactions.component.html',
    styleUrls: ['./interactions.component.scss'],
})
export class InteractionsComponent extends AppComponentBase implements OnInit, OnChanges {
    @Output() refreshStats : EventEmitter<boolean> = new EventEmitter<boolean>()
    @Input() entityId: number
    @Input() relatedEntityId: number
    @Input() postCreatorUserId: number
    @Input() parentId: number
    @Input() threadId: number
    showReactionsPopup: boolean = false
    defaultReactionType: Reactions = this._reactionService.defaultReactionType
    currentUserReaction: AppEntityUserReactionDto = new AppEntityUserReactionDto()
    userId: number
    usersReactionsStats: AppEntityUserReactionsCountDto = new AppEntityUserReactionsCountDto()
    deleteReactionSubs:Subscription
    createUserViewSubs:Subscription
    createReactionSubs:Subscription
    getUsersReactionsCountSubs:Subscription
    getCurrentUserReactionSubs:Subscription
    showComments:boolean = false
    @ViewChild('commentParentComponent',{ static:true }) commentParentComponent : CommentParentComponent

    constructor(
        injector: Injector,
        private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
        private _reactionService: ReactionsService
    ) {
        super(injector)
        this.userId = this.appSession.userId;
    }

    ngOnInit(): void {
        this.defaultReactionType = this._reactionService?.defaultReactionType
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.entityId) {
            this.getCurrentUserReaction()
            this.getUsersReactionsCount()
        }
    }

    getCurrentUserReaction() {
        if( this.getCurrentUserReactionSubs?.closed === false )  this.getCurrentUserReactionSubs.unsubscribe()
        this.getCurrentUserReactionSubs = this._appEntitiesServiceProxy.getCurrentUserReaction(this.entityId)
            .subscribe((result) => {
                this.currentUserReaction.id = result.id
                this.currentUserReaction.reactionSelected = result.reactionSelected
            })
    }

    getUsersReactionsCount() {
        if( this.getUsersReactionsCountSubs?.closed === false )  this.getUsersReactionsCountSubs.unsubscribe()
        this.getUsersReactionsCountSubs = this._appEntitiesServiceProxy.getUsersReactionsCount(this.entityId)
            .subscribe((result) => {
                this.usersReactionsStats.reactionsCount = result.reactionsCount || 0
                this.usersReactionsStats.celebrateCount = result.celebrateCount || 0
                this.usersReactionsStats.curiousCount = result.curiousCount || 0
                this.usersReactionsStats.loverCount = result.loverCount || 0
                this.usersReactionsStats.likeCount = result.likeCount || 0
                this.usersReactionsStats.insightfulCount = result.insightfulCount || 0
                this.usersReactionsStats.viewersCount = result.viewersCount || 0
                this.usersReactionsStats.commentsCount = result.commentsCount || 0
            })
    }

    changeReaction(reactionType: Reactions) {
        const oldReaction: Reactions = this.currentUserReaction.reactionSelected
        const newReaction: Reactions = reactionType
        if (oldReaction == newReaction) return
        this.currentUserReaction.reactionSelected = newReaction
        if(oldReaction) this.changeReactionLocally(oldReaction,-1)
        this.changeReactionLocally(newReaction,1)
        if( this.createReactionSubs?.closed === false )  this.createReactionSubs.unsubscribe()
        this.createReactionSubs = this.createReaction(this.entityId, newReaction)
            .subscribe((result) => {
                if (!this.currentUserReaction.id) {
                    this.getCurrentUserReaction()
                }
                this.getUsersReactionsCount()
            })
    }

    changeReactionLocally(reaction : Reactions, change:1|-1){
        switch (reaction) {
            case Reactions.Like:
                this.usersReactionsStats.likeCount += change
                break;
            case Reactions.Celebrate:
                this.usersReactionsStats.celebrateCount += change
                break;
            case Reactions.Curious:
                this.usersReactionsStats.curiousCount += change
                break;
            case Reactions.Insightful:
                this.usersReactionsStats.insightfulCount += change
                break;
            case Reactions.Love:
                this.usersReactionsStats.loverCount += change
                break;
        }
        this.usersReactionsStats.reactionsCount += change
        if( change == 1 ) this.currentUserReaction.reactionSelected = reaction
        if( change == -1 ) this.currentUserReaction.reactionSelected = undefined
    }

    createReaction(entityId: number, newReaction: Reactions) {
        return this._appEntitiesServiceProxy.createOrUpdateReaction(
            entityId,
            newReaction,
        )
    }

    deleteReaction() {
        const oldReaction : Reactions = this.currentUserReaction.reactionSelected
        if(oldReaction) this.changeReactionLocally(oldReaction,-1)
        if( this.deleteReactionSubs?.closed === false )  this.deleteReactionSubs.unsubscribe()
        this.deleteReactionSubs = this._appEntitiesServiceProxy.deleteUserReaction(this.currentUserReaction.id)
            .subscribe((result) => {
                this.currentUserReaction.reactionSelected = undefined
                this.currentUserReaction.id = undefined
                this.getUsersReactionsCount()
            })
    }

    createView(){
        if( this.createUserViewSubs?.closed === false)  this.createUserViewSubs.unsubscribe()
        this.createUserViewSubs =  this._appEntitiesServiceProxy.createUserView(this.entityId)
        .subscribe(()=>{
            this.getUsersReactionsCount()
        })
    }
    changeCommentCountLocally(change:1|-1){
        if(this.usersReactionsStats.commentsCount == undefined) this.usersReactionsStats.commentsCount = 0
        this.usersReactionsStats.commentsCount += change
        this.refreshStats.emit()
        if (!this.currentUserReaction.id) {
            this.getCurrentUserReaction()
        }
        this.getUsersReactionsCount()
    }
    triggerCommentsList(value?:boolean){
        this.showComments = value == undefined ? !this.showComments : value
        this.commentParentComponent.show(this.postCreatorUserId,this.relatedEntityId,this.parentId,this.threadId)
    }
    showAddComment(){
        this.triggerCommentsList(true)
        if(this.showComments) this.commentParentComponent.focusAddComment()
    }
}
