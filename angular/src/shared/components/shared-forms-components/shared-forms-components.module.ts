import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownWithPaginationComponent } from './dropdown-with-pagination/dropdown-with-pagination.component';
import { UtilsModule } from '@shared/utils/utils.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';



@NgModule({
    declarations: [
        DropdownWithPaginationComponent
    ],
    imports: [
        CommonModule,
        UtilsModule,
        DropdownModule,
        MultiSelectModule,
        FormsModule,
        ReactiveFormsModule
    ],
    exports: [
        DropdownWithPaginationComponent
    ],
})
export class SharedFormsComponentsModule { }
