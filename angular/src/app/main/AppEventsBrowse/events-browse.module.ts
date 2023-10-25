import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventsBrowseFiltersComponent } from './components/events-browse-filters/events-browse-filters.component';
import { EventsBrowseCardComponent } from './components/events-browse-card/events-browse-card.component';
import { EventsBrowseComponent } from './components/events-browse/events-browse.component';
import { UtilsModule } from '@shared/utils/utils.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { EventsBrowseActionsMenuComponent } from './components/events-browse-actions-menu/events-browse-actions-menu.component';
import { FiltersSharedModule } from '@app/shared/filters-shared/filters-shared.module';
import { eventsModule } from '../AppEvent/events.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PostsModule } from '../posts/posts.module';
import { AccordionModule } from 'primeng/accordion';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';



@NgModule({
    declarations: [
        EventsBrowseFiltersComponent,
        EventsBrowseCardComponent ,
        EventsBrowseComponent,
        EventsBrowseActionsMenuComponent
    ],
    imports: [
        CommonModule,
        UtilsModule,
        FormsModule,
        ReactiveFormsModule,
        AppCommonModule,
        PaginatorModule,
        BsDropdownModule.forRoot(),
        ModalModule.forRoot(),
        TableModule,
        ModalModule,
        AccordionModule,
        FiltersSharedModule,
        eventsModule,
        BsDatepickerModule.forRoot(),
        PostsModule
    ],
    exports:[
        EventsBrowseComponent
    ]
})
export class EventsBrowseModule { }
