import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiSelectionFilterComponent } from './components/multi-selection-filter.component';
import { CheckboxModule, TreeModule } from 'primeng';
import { AppCommonModule } from '../common/app-common.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UtilsModule } from '@shared/utils/utils.module';
import { TreeSingleSelectionFilterComponent } from './components/tree-single-selection-filter.component';
import { TreeMultiSelectionFilterComponent } from './components/tree-multi-selection-filter.component';
import { SingleSelectionFilterComponent } from './components/single-selection-filter.component';



@NgModule({
    declarations: [
        MultiSelectionFilterComponent,
        TreeSingleSelectionFilterComponent,
        TreeMultiSelectionFilterComponent,
        SingleSelectionFilterComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        AppCommonModule,
        UtilsModule,
        CheckboxModule,
        TreeModule
    ],
    exports: [
        MultiSelectionFilterComponent,
        TreeSingleSelectionFilterComponent,
        TreeMultiSelectionFilterComponent,
        SingleSelectionFilterComponent
    ]
})
export class FiltersSharedModule { }
