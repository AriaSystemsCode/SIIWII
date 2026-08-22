import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { CategoriesModule } from '@app/categories/categories.module';
import { ClassificationModule } from '@app/classification/classification.module';
import { AppItemTypeModule } from '@app/app-item-type/app-item-type.module';
import { AppEntityDynamicModalModule } from '@app/app-entity-dynamic-modal/app-entity-dynamic-modal.module';

import { FileUploadModule } from 'ng2-file-upload';
import { AccordionModule } from 'primeng/accordion';
import { EditorModule } from 'primeng/editor';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TreeModule } from 'primeng/tree';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { dynamicInputs } from '@shared/components/dynamicInputs/dynamicInputs.component';
import { BsDatepickerModule } from '@node_modules/ngx-bootstrap/datepicker';
import { CalendarModule } from 'primeng/calendar';
import { dynamicInputsView } from '@shared/components/dynamic-inputs-view/dynamic-inputs-view.component';
import { InputSwitchModule } from 'primeng/inputswitch';
import { relatedItemModule } from '@app/relatedItems/relatedItem.module';


@NgModule({
  declarations: [
 
    dynamicInputs,
    dynamicInputsView
  ],
  imports: [
   
   CommonModule,
  
    FormsModule,
    ReactiveFormsModule,
    AppCommonModule,
    UtilsModule,
    FileUploadModule,
    PaginatorModule,
    TabsModule.forRoot(),
    EditorModule,
    MultiSelectModule,
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    BsDatepickerModule.forRoot(),
    TableModule,
    ModalModule,
    TreeModule,
    AccordionModule,
    CategoriesModule,
    ClassificationModule,
    relatedItemModule,
    AppItemTypeModule,
    SelectButtonModule,
    AppEntityDynamicModalModule,
    CalendarModule,
    InputNumberModule,
    InputSwitchModule,
    
  ],

  exports:[
    dynamicInputs,
    dynamicInputsView
  ],
  providers:[
  
  ]
})
export class SharedDynamicInputsModule  { }

