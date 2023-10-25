import { Component, Injector, Input, ViewChild } from '@angular/core';
import { ReactionsDetailsModalComponent } from '@app/main/reactions/components/reactions-details-modal/reactions-details-modal.component';
import { Reactions } from '@app/main/reactions/models/Reactions.enum';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppEntityUserReactionsCountDto } from '@shared/service-proxies/service-proxies';

@Component({
  selector: 'app-reactions-stats',
  templateUrl: './reactions-stats.component.html',
  styleUrls: ['./reactions-stats.component.scss']
})
export class ReactionsStatsComponent extends AppComponentBase {
    @ViewChild('reactionsDetailsModal') reactionsDetailsModal : ReactionsDetailsModalComponent
    @Input() entityId: number
    @Input() currentUserReaction: Reactions
    @Input() usersReactionsStats : AppEntityUserReactionsCountDto
    @Input() showCurrentUserReactionText : boolean = true
    Reactions = Reactions
    constructor(
        private injector : Injector,
        ) {
            super(injector)
    }

    openReactionsDetailsModal(){
        this.reactionsDetailsModal.show(this.entityId,this.usersReactionsStats)
    }
}
