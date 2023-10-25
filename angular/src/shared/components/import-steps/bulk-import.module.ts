import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BulkImportRoutingModule } from './bulk-import-routing.module';
import { MainImportComponent } from './components/mainImport.component'
import { BrowseFolderComponent } from './components/browseFolder.component'
import { GenericProgressComponent } from './components/GenericProgress.Component'
import { uploadStatusComponent } from './components/uploadStatus.component'
import { autoCropComponent } from './components/autoCrop.component'
import { imageCroppingComponent } from './components/imageCropping.Component'
import { MainImportService } from './services/mainImport.service'
import { importConfirmationComponent } from './components/importConfirmation.component'
import { successfullyImportComponent } from './components/successfullyImport.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { UtilsModule } from '@shared/utils/utils.module';
import CountoModule from 'angular2-counto';
import { NgImageSliderModule } from 'ng-image-slider';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { ImageCropperModule } from 'ngx-image-cropper';
import { AccountsImport } from './services/accountsImport.service';
import { itemsImport } from './services/itemsImport.service';
import { CheckboxModule } from 'primeng/checkbox';
import { TreeModule } from 'primeng/tree';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { FileUploadModule } from 'ng2-file-upload';

@NgModule({
    declarations: [
        MainImportComponent,
        BrowseFolderComponent,
        GenericProgressComponent,
        uploadStatusComponent,
        autoCropComponent,
        imageCroppingComponent,
        importConfirmationComponent,
        successfullyImportComponent
    ],
    imports: [
        CommonModule,
        BulkImportRoutingModule,
        ImageCropperModule,
        AppCommonModule,
        FormsModule,
        ReactiveFormsModule,
        ModalModule.forRoot(),
        FileUploadModule,
        MultiSelectModule,
        DropdownModule,
        UtilsModule,
        CountoModule,
        NgImageSliderModule,
        BsDatepickerModule.forRoot(),
        BsDropdownModule.forRoot(),
        PopoverModule.forRoot(),
        TreeModule,
        CheckboxModule,
    ],
    providers: [
        MainImportService,AccountsImport,itemsImport
    ],
    exports:[
        MainImportComponent,
        BrowseFolderComponent,
        GenericProgressComponent,
        uploadStatusComponent,
        autoCropComponent,
        imageCroppingComponent,
        importConfirmationComponent,
        successfullyImportComponent
    ]
})
export class BulkImportModule { }
