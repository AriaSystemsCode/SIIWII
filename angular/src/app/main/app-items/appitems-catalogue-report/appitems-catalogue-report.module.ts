import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { AppitemsCatalogueReportRoutingModule } from './appitems-catalogue-report-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { DropdownModule } from "primeng/dropdown";
import { ModalModule } from 'ngx-bootstrap/modal';
import { AppitemslistCatalogueReportComponent } from './components/appitemslist-catalogue-report.component';
import { CatalogueReportChooseTemplateStepComponent } from './components/catalogue-report-choose-template-step.component';
import { CatalogueReportTemplateCardComponent } from './components/catalogue-report-template-card.component';
import { CatalogueReportProductsPrintInfoComponent } from './components/catalogue-report-products-print-info.component';
import { DevExpressDemoModule } from '@app/main/dev-express-demo/dev-express-demo.module';
import { CatalogueReportDataSelectionStepComponent} from './components/catalogue-report-data-selection-step.component';
import { CatalogueReportCoverPageStepComponent } from './components/catalogue-report-cover-page-step.component';
import { CatalogueDetailInfoStepComponent } from './components/catalogue-detail-info-step.component';
import { EditorModule } from 'primeng/editor';
import { AppItemsBrowseModule } from '@app/main/app-items/app-items-browse/app-items-browse.module';
import { AppItemSharedModule } from '../app-item-shared/app-item-shared.module';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputSwitchModule } from 'primeng/inputswitch';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';


@NgModule({
  declarations: [
      AppitemslistCatalogueReportComponent,
      CatalogueReportChooseTemplateStepComponent,
      CatalogueReportTemplateCardComponent,
      CatalogueReportProductsPrintInfoComponent,
      CatalogueReportDataSelectionStepComponent,
      CatalogueReportCoverPageStepComponent,
      CatalogueDetailInfoStepComponent
    ],
    imports: [
    CommonModule,
    AppitemsCatalogueReportRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AppCommonModule,
    UtilsModule,
    BsDropdownModule.forRoot(),
    DropdownModule,
    ModalModule.forRoot(),
    AutoCompleteModule,
    InputSwitchModule,
    DevExpressDemoModule,
     EditorModule ,
    PaginatorModule,
    TableModule,
    AppItemSharedModule,
    AppItemsBrowseModule,
    AccordionModule
  ], 
  exports : [
    AppitemslistCatalogueReportComponent,
    CatalogueReportChooseTemplateStepComponent,
    CatalogueReportTemplateCardComponent,
    CatalogueReportProductsPrintInfoComponent,
    CatalogueReportDataSelectionStepComponent,
    CatalogueReportCoverPageStepComponent,
    CatalogueDetailInfoStepComponent
  ]
})
export class AppitemsCatalogueReportModule { }
