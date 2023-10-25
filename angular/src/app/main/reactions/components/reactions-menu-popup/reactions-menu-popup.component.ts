import { Component, EventEmitter, Injector, Output } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Reactions } from '../../models/Reactions.enum';

@Component({
  selector: 'app-reactions-menu-popup',
  templateUrl: './reactions-menu-popup.component.html',
  styleUrls: ['./reactions-menu-popup.component.scss']
})
export class ReactionsMenuPopupComponent extends AppComponentBase {
    @Output() reactionChanged : EventEmitter<Reactions> = new EventEmitter<Reactions>()
    Reactions = Reactions
    constructor(
        private injector:Injector,
        ) {
        super(injector);
    }
    setReaction($event, reaction:Reactions){
        $event.cancelBubble = true;
        this.reactionChanged.emit(reaction)
    }
}
