import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SocializationStatsRoutingModule } from './socialization-stats-routing.module';
import { ReactionsStatsComponent } from './components/reactions-stats/reactions-stats.component';
import { ReactionsModule } from '../reactions/reactions.module';
import { onetouchCommonModule } from '@shared/common/common.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { ViewsStatsComponent } from './components/views-stats/views-stats.component';
import { CommentsStatsComponent } from './components/comments-stats/comments-stats.component';
@NgModule({
    declarations: [
        ReactionsStatsComponent,
        ViewsStatsComponent,
        CommentsStatsComponent,
    ],
    imports: [
        CommonModule,
        UtilsModule,
        onetouchCommonModule,
        SocializationStatsRoutingModule,
        ReactionsModule
    ],
    exports:[
        ReactionsStatsComponent,
        ViewsStatsComponent,
        CommentsStatsComponent
    ]
})
export class SocializationStatsModule { }
