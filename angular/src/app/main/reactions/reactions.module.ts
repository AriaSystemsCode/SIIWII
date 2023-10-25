import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactionsRoutingModule } from './reactions-routing.module';
import { ReactionsActionComponent } from './components/reactions-action/reactions-action.component';
import { ReactionsDetailsModalComponent } from './components/reactions-details-modal/reactions-details-modal.component';
import { ReactionsMenuPopupComponent } from './components/reactions-menu-popup/reactions-menu-popup.component';
import { ReactionsService } from '../interactions/services/reactions.service';
import { UtilsModule } from '@shared/utils/utils.module';
import { onetouchCommonModule } from '@shared/common/common.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { AppCommonModule } from '@app/shared/common/app-common.module';

@NgModule({
    declarations: [
        ReactionsDetailsModalComponent,
        ReactionsActionComponent,
        ReactionsMenuPopupComponent
    ],
    imports: [
        CommonModule,
        ReactionsRoutingModule,
        UtilsModule,
        onetouchCommonModule,
        ModalModule.forRoot(),
        PopoverModule.forRoot(),
        AppCommonModule
    ],
    exports: [
        ReactionsDetailsModalComponent,
        ReactionsActionComponent,
        ReactionsMenuPopupComponent
    ],
    providers:[ReactionsService]
})
export class ReactionsModule { }
