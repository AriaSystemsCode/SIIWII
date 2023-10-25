import { Component, Injector, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppEntitiesServiceProxy, AppEntityUserReactionsCountDto, AppEntityUserReactionsDto, AppPostsServiceProxy } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';
import { Reactions } from '../../models/Reactions.enum';
class ReactionDetails {
    title: string
    reaction: Reactions
    users: AppEntityUserReactionsDto[]
    count:number
}
@Component({
    selector: 'app-reactions-details-modal',
    templateUrl: './reactions-details-modal.component.html',
    styleUrls: ['./reactions-details-modal.component.scss']
})
export class ReactionsDetailsModalComponent extends AppComponentBase {
    @ViewChild('modal', { static: true }) modal: ModalDirective;
    Reactions = Reactions
    usersReactionsStats: AppEntityUserReactionsCountDto
    entityId: number
    active: boolean = false
    users: AppEntityUserReactionsDto[]
    selectedReactionIndex: number
    reactionsDetails: ReactionDetails[]
    public constructor(
        private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
        private _postService:AppPostsServiceProxy,
        injector: Injector
    ) {
        super(injector);
    }

    async show(entityId: number, usersReactionsStats: AppEntityUserReactionsCountDto) {
        this.entityId = entityId
        this.usersReactionsStats = usersReactionsStats
        this.determineSelectedReactionsDetails(this.usersReactionsStats)
        this.active = true
        this.modal.show();
        this.changeReactionFilter()
    }

    getReactionUsers(reaction?:Reactions) : Observable<AppEntityUserReactionsDto[]>{
        if(reaction === undefined) return this._appEntitiesServiceProxy.getAllUsersReactions(this.entityId, reaction).pipe(pluck('items'))
        else return this.filterUsersBy(reaction)
    }

    filterUsersBy(reaction:Reactions) : Observable<AppEntityUserReactionsDto[]>{
        return new Observable<AppEntityUserReactionsDto[]>((subscriber)=>{
            const filteredUsers :AppEntityUserReactionsDto[] = this.reactionsDetails[0].users.filter((user)=>{
                return user.reactionSelected == reaction
            })
            subscriber.next(filteredUsers)
        })
    }

    async changeReactionFilter(index:number = 0) {
        if (this.selectedReactionIndex == index) return
        this.selectedReactionIndex = index
        const currentReaction = this.reactionsDetails[index]
        if(currentReaction.users.length > 0 ) return
        this.getReactionUsers(currentReaction.reaction)
        .subscribe((res)=>{
            currentReaction.users = res
            currentReaction.users.forEach((user)=>{
                this.getProfilePictureById(user.profilePictureId,user)
            })
        },err=>{
        })
    }

    hide() {
        this.resetState()
        this.modal.hide();
    }
    resetState(){
        this.usersReactionsStats = undefined
        this.active = false
        this.selectedReactionIndex = undefined
        this.reactionsDetails = undefined
    }
    determineSelectedReactionsDetails(usersReactionsStats: AppEntityUserReactionsCountDto) {
        this.initSelectedReactionsDetails()
        if (usersReactionsStats?.reactionsCount < 1) return
        if (usersReactionsStats?.likeCount > 0) this.reactionsDetails.push({ reaction: Reactions.Like, users: [], title: Reactions[Reactions.Like], count:usersReactionsStats.likeCount })
        if (usersReactionsStats?.loverCount > 0) this.reactionsDetails.push({ reaction: Reactions.Love, users: [], title: Reactions[Reactions.Love], count:usersReactionsStats.loverCount })
        if (usersReactionsStats?.celebrateCount > 0) this.reactionsDetails.push({ reaction: Reactions.Celebrate, users: [], title: Reactions[Reactions.Celebrate], count:usersReactionsStats.celebrateCount })
        if (usersReactionsStats?.insightfulCount > 0) this.reactionsDetails.push({ reaction: Reactions.Insightful, users: [], title: Reactions[Reactions.Insightful], count:usersReactionsStats.insightfulCount })
        if (usersReactionsStats?.curiousCount > 0) this.reactionsDetails.push({ reaction: Reactions.Curious, users: [], title: Reactions[Reactions.Curious], count:usersReactionsStats.curiousCount })
    }
    initSelectedReactionsDetails() {
        const allReactionDetails = new ReactionDetails();
        allReactionDetails.title = "All";
        allReactionDetails.reaction = undefined;
        allReactionDetails.users = [];
        allReactionDetails.count = this.usersReactionsStats.reactionsCount;
        this.reactionsDetails = [allReactionDetails];
    }
    handleFailedImage($event){
        $event.target.src = 'assets/common/images/default-profile-picture.png';

    }
    getProfilePictureById(id: string,user:AppEntityUserReactionsDto) {
        const subs = this._postService
            .getProfilePictureAllByID(id)
            .subscribe((data) => {
                if (data.profilePicture) {
                    user.profilePictureUrl = "data:image/jpeg;base64," + data.profilePicture;
                }
            });
    }
}
