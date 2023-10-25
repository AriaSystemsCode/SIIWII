import { Component, EventEmitter, Injector, Input, Output } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Reactions } from '../../models/Reactions.enum';

@Component({
  selector: 'app-reactions-action',
  templateUrl: './reactions-action.component.html',
  styleUrls: ['./reactions-action.component.scss']
})
export class ReactionsActionComponent extends AppComponentBase {
    @Input() currentUserReaction : Reactions
    @Input() showCurrentUserReactionText : boolean = true
    @Output() reactionChanged : EventEmitter<Reactions> = new EventEmitter<Reactions>()
    @Output() reactionRemoved : EventEmitter<boolean> = new EventEmitter<boolean>()
    showReactionsPopup: boolean = false
    defaultReactionType : Reactions = Reactions.Like
    Reactions = Reactions
    constructor(
        private injector:Injector,
        ) {
        super(injector);
    }
    handleReactionChange(reactionType: Reactions) {
        this.reactionChanged.emit(reactionType)
    }
    setDefaultReact() {
        this.handleReactionChange( this.defaultReactionType )
    }
    unReact() {
        this.reactionRemoved.emit()
    }
    triggerReaction(){
        if( this.currentUserReaction ) {
            this.unReact()
        } else {
            this.setDefaultReact()
        }
    }
}
