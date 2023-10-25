import { Component, ViewChild, Injector, Output, EventEmitter} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { SycEntityObjectTypesServiceProxy, CreateOrEditSycEntityObjectTypeDto ,SycEntityObjectTypeSydObjectLookupTableDto
					,SycEntityObjectTypeSycEntityObjectTypeLookupTableDto
                    ,SycIdentifierDefinitionsServiceProxy
                    ,SycEntityObjectTypeSycIdentifierDefinitionLookupTableDto
					} from '@shared/service-proxies/service-proxies';

import { AppComponentBase } from '@shared/common/app-component-base';
import { DomSanitizer } from '@angular/platform-browser';
import { SycEntityObjectTypeSycIdentifierDefinitionLookupTableModalComponent } from './sycEntityObjectType-sycIdentifierDefinition-lookup-table-modal.component';

@Component({
    selector: 'createOrEditSycEntityObjectTypeModal',
    templateUrl:'./create-or-edit-sycEntityObjectType-modal.component.html',
    styleUrls : ['./create-or-edit-sycEntityObjectType-modal.component.scss']
})
export class CreateOrEditSycEntityObjectTypeModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('sycEntityObjectTypeSycIdentifierDefinitionLookupTableModal', { static: true }) sycEntityObjectTypeSycIdentifierDefinitionLookupTableModal: SycEntityObjectTypeSycIdentifierDefinitionLookupTableModalComponent;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    sycEntityObjectType: CreateOrEditSycEntityObjectTypeDto = new CreateOrEditSycEntityObjectTypeDto();

    sydObjectName = '';
    sycEntityObjectTypeName = '';
    sycIdentifierDefinitionCode = '';
	allSydObjects: SycEntityObjectTypeSydObjectLookupTableDto[];
	allSycEntityObjectTypes: SycEntityObjectTypeSycEntityObjectTypeLookupTableDto[];
    allSycEntityObjectTypeSycIdentifierDefinitionLookupTableDto: SycEntityObjectTypeSycIdentifierDefinitionLookupTableDto[];

    constructor(
        injector: Injector,
        private _sycEntityObjectTypesServiceProxy: SycEntityObjectTypesServiceProxy,
        private _sycIdentifierDefinitionsServiceProxy: SycIdentifierDefinitionsServiceProxy,
        private sanitizer: DomSanitizer
    ) {
        super(injector);
    }

    show(entityObjectTypeId?: number): void {

        if (!entityObjectTypeId) {
            this.sycEntityObjectType = new CreateOrEditSycEntityObjectTypeDto();
            this.sycEntityObjectType.id = entityObjectTypeId;
            this.sydObjectName = '';
            this.sycEntityObjectTypeName = '';
            this.sycIdentifierDefinitionCode = '';

            this.active = true;
            this.modal.show();
        } else {
            this._sycEntityObjectTypesServiceProxy.getSycEntityObjectTypeForEdit(entityObjectTypeId).subscribe(result => {
                this.sycEntityObjectType = result.sycEntityObjectType;

                this.sydObjectName = result.sydObjectName;
                this.sycEntityObjectTypeName = result.sycEntityObjectTypeName;
                this.sycIdentifierDefinitionCode = result.identifierCode;

                this.active = true;
                this.modal.show();
            });
        }
        this._sycEntityObjectTypesServiceProxy.getAllSydObjectForTableDropdown().subscribe(result => {
						this.allSydObjects = result;
					});
					this._sycEntityObjectTypesServiceProxy.getAllSycEntityObjectTypeForTableDropdown().subscribe(result => {
						this.allSycEntityObjectTypes = result;
					});

       this._sycIdentifierDefinitionsServiceProxy.getAllSycIdentifierDefinitionForLookupTable(undefined,undefined,0,1000).subscribe(
        result=>
        {this.allSycEntityObjectTypeSycIdentifierDefinitionLookupTableDto = result.items;

        }
       )             

    }

    save(): void {
            this.saving = true;


            this._sycEntityObjectTypesServiceProxy.createOrEdit(this.sycEntityObjectType)
             .pipe(finalize(() => { this.saving = false;}))
             .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
             });
    }

    openSelectSycIdentifierDefinitionModal() {
       // this.sycEntityObjectTypeSycIdentifierDefinitionLookupTableModal.id = this.sycEntityObjectType.sycIdentifierDefinitionId;
        //this.sycEntityObjectTypeSycIdentifierDefinitionLookupTableModal.displayName = this.sycIdentifierDefinitionCode;
        this.sycEntityObjectTypeSycIdentifierDefinitionLookupTableModal.show();
    }


    setSycIdentifierDefinitionIdNull() {
        this.sycEntityObjectType.sycIdentifierDefinitionId = null;
        this.sycIdentifierDefinitionCode = '';
    }


    getNewSycIdentifierDefinitionId() {
        this.sycEntityObjectType.sycIdentifierDefinitionId = this.sycEntityObjectTypeSycIdentifierDefinitionLookupTableModal.id;
        this.sycIdentifierDefinitionCode = this.sycEntityObjectTypeSycIdentifierDefinitionLookupTableModal.displayName;
    }


    xmlParser(response:string) : any{

        const parser = new DOMParser();
        const xml = parser.parseFromString(response, 'application/xml');
        const questionSet : any = xml.documentElement;
        return this.sanitizer.bypassSecurityTrustHtml( questionSet); // this line bypasses angular scurity
    }



    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
