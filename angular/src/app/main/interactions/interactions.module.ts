import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InteractionsRoutingModule } from './interactions-routing.module';
import { InteractionsComponent } from './components/interactions.component';
import { ReactionsModule } from '../reactions/reactions.module';
import { SocializationStatsModule } from '../socialization-stats/socialization-stats.module';
import { ReactionsService } from './services/reactions.service';
import { UtilsModule } from '@shared/utils/utils.module';
import { onetouchCommonModule } from '@shared/common/common.module';
import { CommentsModule } from '../comments/comments.module';
import { CommentParentComponent } from './components/comment-parent/comment-parent.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//import { MessagesModule } from '../Messages/messages.module';
import { SendDirectMessageComponent } from './components/send-direct-message/send-direct-message.component';
import { AppCommonModule } from '@app/shared/common/app-common.module';

@NgModule({
    declarations: [
        InteractionsComponent,
        CommentParentComponent,
        SendDirectMessageComponent,
    ],
    imports: [
        CommonModule,
       /// MessagesModule,
        UtilsModule,
        onetouchCommonModule,
        InteractionsRoutingModule,
        ReactionsModule,
        SocializationStatsModule,
        CommentsModule,
        FormsModule,
        ReactiveFormsModule,
        AppCommonModule
    ],
    exports:[
        InteractionsComponent,
        CommentParentComponent
    ],
    providers:[ReactionsService]           
})
export class InteractionsModule { }
