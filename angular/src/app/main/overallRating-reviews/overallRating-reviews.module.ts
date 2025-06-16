import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule  } from '@angular/forms';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { PaginatorModule } from 'primeng/paginator';
import { EditorModule } from 'primeng/editor';
import { InputMaskModule } from 'primeng/inputmask';
 import { FileUploadModule } from 'primeng/fileupload';

import { UtilsModule } from '@shared/utils/utils.module';

import { ModalModule } from 'ngx-bootstrap/modal';

import { DropdownModule } from 'primeng/dropdown';
import { Ng2TelInputModule } from 'ng2-tel-input';
import { NgImageSliderModule } from 'ng-image-slider';

import { OverallRatingComponent } from './overallRatings/overallRating.component';
import { AllReviewsListComponent } from './all-reviews-list/all-reviews-list.component';
import { DialogModule } from 'primeng/dialog';
import { InteractionsModule } from '../interactions/interactions.module';
import { QuestionsComponent } from './questions/questions.component';

@NgModule({
  declarations: [OverallRatingComponent,AllReviewsListComponent,QuestionsComponent],
  imports: [
    CommonModule,
    AppCommonModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    DialogModule,
    FileUploadModule,
    AutoCompleteModule,
    PaginatorModule,
    EditorModule,
    DropdownModule,
    InputMaskModule,
    InteractionsModule,
    Ng2TelInputModule,
    UtilsModule,
    NgImageSliderModule,
 
  ],
  exports: [OverallRatingComponent,AllReviewsListComponent,QuestionsComponent],

})


export class OverALLRatingReviewsModule { }
