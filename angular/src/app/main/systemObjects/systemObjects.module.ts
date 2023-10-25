import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemObjectsRoutingModule } from './systemObjects-routing.module';
import { SystemObjectsComponent } from './systemObjects.component';
 import { CreateOrEditSycEntityObjectTypeModalComponent } from '../systemObjects/sycEntityObjectTypes/create-or-edit-sycEntityObjectType-modal.component';
import { SydObjectsComponent } from '../systemObjects/sydObjects/sydObjects.component';
import { SysObjectTypesComponent } from '../systemObjects/sysObjectTypes/sysObjectTypes.component';
import { SycAttachmentCategoriesComponent } from '../systemObjects/sycAttachmentCategories/sycAttachmentCategories.component';
import { SuiIconsComponent } from '../systemObjects/suiIcons/suiIcons.component';
import { SycEntityObjectClassificationsComponent } from '../systemObjects/sycEntityObjectClassifications/sycEntityObjectClassifications.component';
import { SycEntityObjectStatusesComponent } from '../systemObjects/sycEntityObjectStatuses/sycEntityObjectStatuses.component';
import { SycEntityObjectCategoriesComponent } from '../systemObjects/sycEntityObjectCategories/sycEntityObjectCategories.component';
import { SycEntityObjectTypesComponent } from '../systemObjects/sycEntityObjectTypes/sycEntityObjectTypes.component';
import { ViewSycAttachmentCategoryModalComponent } from '../systemObjects/sycAttachmentCategories/view-sycAttachmentCategory-modal.component';
import { CreateOrEditSycAttachmentCategoryModalComponent } from '../systemObjects/sycAttachmentCategories/create-or-edit-sycAttachmentCategory-modal.component';
import { CreateOrEditSuiIconModalComponent } from '../systemObjects/suiIcons/create-or-edit-suiIcon-modal.component';
import { ViewSycEntityObjectClassificationModalComponent } from '../systemObjects/sycEntityObjectClassifications/view-sycEntityObjectClassification-modal.component';
import { CreateOrEditSycEntityObjectClassificationModalComponent } from '../systemObjects/sycEntityObjectClassifications/create-or-edit-sycEntityObjectClassification-modal.component';
import { ViewSycEntityObjectStatusModalComponent } from '../systemObjects/sycEntityObjectStatuses/view-sycEntityObjectStatus-modal.component';
import { CreateOrEditSycEntityObjectStatusModalComponent } from '../systemObjects/sycEntityObjectStatuses/create-or-edit-sycEntityObjectStatus-modal.component';
import { ViewSycEntityObjectCategoryModalComponent } from '../systemObjects/sycEntityObjectCategories/view-sycEntityObjectCategory-modal.component';
import { CreateOrEditSycEntityObjectCategoryModalComponent } from '../systemObjects/sycEntityObjectCategories/create-or-edit-sycEntityObjectCategory-modal.component';
import { ViewSydObjectModalComponent } from '../systemObjects/sydObjects/view-sydObject-modal.component';
import { CreateOrEditSydObjectModalComponent } from '../systemObjects/sydObjects/create-or-edit-sydObject-modal.component';
import { CreateOrEditSysObjectTypeModalComponent } from '../systemObjects/sysObjectTypes/create-or-edit-sysObjectType-modal.component';
import { ViewSycEntityObjectTypeModalComponent } from '../systemObjects/sycEntityObjectTypes/view-sycEntityObjectType-modal.component';
import { ViewSysObjectTypeModalComponent } from '../systemObjects/sysObjectTypes/view-sysObjectType-modal.component';
import { FormsModule } from '@angular/forms';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { PaginatorModule } from 'primeng/paginator';
import { EditorModule } from 'primeng/editor';
import { InputMaskModule } from 'primeng/inputmask';
import { FileUploadModule } from 'primeng/fileupload';
import { TableModule } from 'primeng/table';
import { TreeTableModule } from 'primeng/treetable';
import { UtilsModule } from '@shared/utils/utils.module';
import { CountoModule } from 'angular2-counto';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TabMenuModule } from 'primeng/tabmenu';
import {MultiSelectModule} from 'primeng/multiselect';
import {DropdownModule} from 'primeng/dropdown';
import {Ng2TelInputModule} from 'ng2-tel-input';
import { NgImageSliderModule } from 'ng-image-slider';
import { TreeviewModule } from 'ngx-treeview';
import {TreeModule} from 'primeng/tree';

@NgModule({
  declarations: [SystemObjectsComponent,ViewSydObjectModalComponent,ViewSysObjectTypeModalComponent,CreateOrEditSycEntityObjectTypeModalComponent,ViewSycEntityObjectTypeModalComponent,CreateOrEditSydObjectModalComponent,ViewSycEntityObjectCategoryModalComponent,CreateOrEditSycEntityObjectCategoryModalComponent,ViewSycEntityObjectStatusModalComponent,CreateOrEditSycEntityObjectStatusModalComponent,ViewSycEntityObjectClassificationModalComponent,CreateOrEditSycEntityObjectClassificationModalComponent,CreateOrEditSuiIconModalComponent,ViewSycAttachmentCategoryModalComponent,CreateOrEditSycAttachmentCategoryModalComponent,SycEntityObjectTypesComponent,SycEntityObjectStatusesComponent,SycEntityObjectCategoriesComponent,SydObjectsComponent,SycEntityObjectClassificationsComponent,SuiIconsComponent,SysObjectTypesComponent,SycAttachmentCategoriesComponent,CreateOrEditSysObjectTypeModalComponent],
  imports: [
    CommonModule,
    SystemObjectsRoutingModule,
    TreeModule,
    AppCommonModule,
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    TreeviewModule.forRoot(),
FileUploadModule,
AutoCompleteModule,
PaginatorModule,
    EditorModule,
    MultiSelectModule,
    DropdownModule,
InputMaskModule,		TableModule,TreeTableModule,TabMenuModule,
    Ng2TelInputModule,
    CommonModule,
    FormsModule,
    ModalModule,
    TabsModule,
    TooltipModule,
    UtilsModule,
    CountoModule,
    NgxChartsModule,
    NgImageSliderModule,
    BsDatepickerModule.forRoot(),
    BsDropdownModule.forRoot(),
    PopoverModule.forRoot(),

  ]
})
export class SystemObjectsModule { }
