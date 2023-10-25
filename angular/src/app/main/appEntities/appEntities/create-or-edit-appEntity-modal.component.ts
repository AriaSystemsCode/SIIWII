import { Component, ViewChild, Injector, Output, EventEmitter, Input} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { AppEntitiesServiceProxy, CreateOrEditAppEntityDto ,AppEntitySycEntityObjectTypeLookupTableDto
					,AppEntitySycEntityObjectStatusLookupTableDto
					,AppEntitySydObjectLookupTableDto
					} from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';

@Component({
    selector: 'createOrEditAppEntityModal',
    styleUrls: ['./create-or-edit-appEntity-modal.component.css'],
    templateUrl: './create-or-edit-appEntity-modal.component.html'
})
export class CreateOrEditAppEntityModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    displaySaveSideBar:boolean=false;

    @Input() entityObjectType: any;

    appEntity: CreateOrEditAppEntityDto = new CreateOrEditAppEntityDto();

    sycEntityObjectTypeName = '';
    sycEntityObjectStatusName = '';
    sydObjectName = '';

	allSycEntityObjectTypes: AppEntitySycEntityObjectTypeLookupTableDto[];
						allSycEntityObjectStatuss: AppEntitySycEntityObjectStatusLookupTableDto[];
						allSydObjects: AppEntitySydObjectLookupTableDto[];

    constructor(
        injector: Injector,
        private _appEntitiesServiceProxy: AppEntitiesServiceProxy
    ) {
        super(injector);
    }

    show(appEntityId?: number): void {

        if (!appEntityId) {
            this.appEntity = new CreateOrEditAppEntityDto();
            this.appEntity.id = appEntityId;
            this.sycEntityObjectTypeName = '';
            this.sycEntityObjectStatusName = '';
            this.sydObjectName = '';

            this.active = true;
            this.modal.show();
        } else {
            this._appEntitiesServiceProxy.getAppEntityForEdit(appEntityId).subscribe(result => {
                this.appEntity = result.appEntity;

                this.sycEntityObjectTypeName = result.sycEntityObjectTypeName;
                this.sycEntityObjectStatusName = result.sycEntityObjectStatusName;
                this.sydObjectName = result.sydObjectName;

                this.active = true;
                this.modal.show();
            });
        }
        this._appEntitiesServiceProxy.getAllSycEntityObjectTypeForTableDropdown().subscribe(result => {
						this.allSycEntityObjectTypes = result;
					});
					this._appEntitiesServiceProxy.getAllSycEntityObjectStatusForTableDropdown().subscribe(result => {
						this.allSycEntityObjectStatuss = result;
					});
					this._appEntitiesServiceProxy.getAllSydObjectForTableDropdown().subscribe(result => {
						this.allSydObjects = result;
					});

    }

    save(): void {
            this.saving = true;

            this.appEntity.entityObjectTypeId = this.entityObjectType.id;

            this._appEntitiesServiceProxy.createOrEdit(this.appEntity)
             .pipe(finalize(() => { this.saving = false;}))
             .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.displaySaveSideBar = true;
                this.modalSave.emit(null);
             });
    }

    onEmitButtonSaveYes(event){

        if(event.value == 'no'){
            this.displaySaveSideBar = false;
            this.show()

        }
        else{
            this.displaySaveSideBar = false;
        }
    }







    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
