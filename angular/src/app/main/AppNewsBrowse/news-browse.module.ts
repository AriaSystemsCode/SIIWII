import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsBrowseFiltersComponent } from './components/news-browse-filters/news-browse-filters.component';
import { NewsBrowseCardComponent } from './components/news-browse-card/news-browse-card.component';
import { NewsBrowseComponent } from './components/news-browse/news-browse.component';
import { UtilsModule } from '@shared/utils/utils.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';

import { AccordionModule } from 'primeng/accordion';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';

import { NewsBrowseActionsMenuComponent } from './components/news-browse-actions-menu/news-browse-actions-menu.component';
import { FiltersSharedModule } from '@app/shared/filters-shared/filters-shared.module';
import { eventsModule } from '../AppEvent/events.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PostsModule } from '../posts/posts.module';



@NgModule({
    declarations: [
        NewsBrowseFiltersComponent,
        NewsBrowseCardComponent ,
        NewsBrowseComponent,
        NewsBrowseActionsMenuComponent
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
        NewsBrowseComponent
    ]
})
export class NewsBrowseModule { }
