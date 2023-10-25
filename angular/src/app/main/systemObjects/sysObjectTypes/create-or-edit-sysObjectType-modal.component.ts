import { Component, ViewChild, Injector, Output, EventEmitter} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { SysObjectTypesServiceProxy, CreateOrEditSysObjectTypeDto ,SysObjectTypeSysObjectTypeLookupTableDto
					} from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';

@Component({
    selector: 'createOrEditSysObjectTypeModal',
    templateUrl: './create-or-edit-sysObjectType-modal.component.html'
})
export class CreateOrEditSysObjectTypeModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    sysObjectType: CreateOrEditSysObjectTypeDto = new CreateOrEditSysObjectTypeDto();

    sysObjectTypeName = '';

	allSysObjectTypes: SysObjectTypeSysObjectTypeLookupTableDto[];
					
    constructor(
        injector: Injector,
        private _sysObjectTypesServiceProxy: SysObjectTypesServiceProxy
    ) {
        super(injector);
    }

    show(objectTypeId?: number): void {

        if (!objectTypeId) {
            this.sysObjectType = new CreateOrEditSysObjectTypeDto();
            this.sysObjectType.id = objectTypeId;
            this.sysObjectTypeName = '';

            this.active = true;
            this.modal.show();
        } else {
            this._sysObjectTypesServiceProxy.getSysObjectTypeForEdit(objectTypeId).subscribe(result => {
                this.sysObjectType = result.sysObjectType;

                this.sysObjectTypeName = result.sysObjectTypeName;

                this.active = true;
                this.modal.show();
            });
        }
        this._sysObjectTypesServiceProxy.getAllSysObjectTypeForTableDropdown().subscribe(result => {						
						this.allSysObjectTypes = result;
					});
					
    }

    save(): void {
            this.saving = true;

			
            this._sysObjectTypesServiceProxy.createOrEdit(this.sysObjectType)
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
}
