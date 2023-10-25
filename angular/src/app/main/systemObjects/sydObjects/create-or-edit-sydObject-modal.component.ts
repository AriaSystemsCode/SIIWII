import { Component, ViewChild, Injector, Output, EventEmitter} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { SydObjectsServiceProxy, CreateOrEditSydObjectDto ,SydObjectSysObjectTypeLookupTableDto
					,SydObjectSydObjectLookupTableDto
					} from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';

@Component({
    selector: 'createOrEditSydObjectModal',
    templateUrl: './create-or-edit-sydObject-modal.component.html'
})
export class CreateOrEditSydObjectModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    sydObject: CreateOrEditSydObjectDto = new CreateOrEditSydObjectDto();

    sysObjectTypeName = '';
    sydObjectName = '';

    allSysObjectTypes: SydObjectSysObjectTypeLookupTableDto[];
    allSysObjectOfEntity: SydObjectSysObjectTypeLookupTableDto[];
    allSydObjects: SydObjectSydObjectLookupTableDto[];
    parentIdEntity:boolean;
    filterType = {id: 1};

    constructor(
        injector: Injector,
        private _sydObjectsServiceProxy: SydObjectsServiceProxy
    ) {
        super(injector);
    }

    show(sydObjectId?: number): void {

        if (!sydObjectId) {
            this.sydObject = new CreateOrEditSydObjectDto();
            this.sydObject.id = sydObjectId;
            this.sysObjectTypeName = '';
            this.sydObjectName = '';

            this.active = true;
            this.modal.show();
        } else {
            this._sydObjectsServiceProxy.getSydObjectForEdit(sydObjectId).subscribe(result => {
                this.sydObject = result.sydObject;

                this.sysObjectTypeName = result.sysObjectTypeName;
                this.sydObjectName = result.sydObjectName;

                this.active = true;
                this.modal.show();
            });
        }
        this._sydObjectsServiceProxy.getAllSysObjectTypeForTableDropdown().subscribe(result => {						
                        this.allSysObjectTypes = result;

					});
					this._sydObjectsServiceProxy.getAllSydObjectForTableDropdown().subscribe(result => {						
                        this.allSydObjects = result;
                        this.allSysObjectOfEntity = this.allSydObjects.filter(x=>x.objectTypeId==1)

					});
					
    }

    save(): void {
            this.saving = true;

			
            this._sydObjectsServiceProxy.createOrEdit(this.sydObject)
             .pipe(finalize(() => { this.saving = false;}))
             .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
             });
    }


    close(): void {
        this.active = false;
        this.modal.hide();
    }

    onTypeChange(value){
        if(value==1){
            this.sydObject.parentId = undefined;
            this.parentIdEntity = true;
        }
        else{
            this.parentIdEntity = false;
        }
        this.parentIdEntity = value==1
    }

}
