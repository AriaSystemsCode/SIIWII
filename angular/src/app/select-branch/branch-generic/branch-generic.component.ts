import {
  Component,
  EventEmitter,
  Injector,
  Output
} from '@angular/core';

import {
  finalize,
  forkJoin
} from 'rxjs';

import {
  AccountsServiceProxy,
  AppEntitiesServiceProxy,
  BranchDto,
  LookupLabelDto
} from '@shared/service-proxies/service-proxies';

import {
  AppComponentBase
} from '@shared/common/app-component-base';
import { EntityBasicInfoField, EntityMode, GenericEntityEditor, GenericEntityNode } from '@app/shared/entity-shell/models/generic-entity.model';


@Component({
  selector: 'app-branch-generic',
  templateUrl: './branch-generic.component.html',
  styleUrls: ['./branch-generic.component.scss']
})
export class BranchGenericComponent
  extends AppComponentBase
  implements GenericEntityEditor {

  node: GenericEntityNode;

  mode: EntityMode = 'view';

  entity: BranchDto =
    new BranchDto();

  entityData: any = {
    branch: this.entity
  };

  loading = false;
  saving = false;

  showMedia = false;

  allPhoneTypes: LookupLabelDto[] = [];
  allLanguages: LookupLabelDto[] = [];
  allCurrencies: LookupLabelDto[] = [];

  private backup:
    BranchDto | null = null;

  @Output()
  entityChange =
    new EventEmitter<any>();

  @Output()
  saved =
    new EventEmitter<any>();

  @Output()
  cancelled =
    new EventEmitter<void>();

  constructor(
    injector: Injector,

    private _accountsService:
      AccountsServiceProxy,

    private _appEntitiesService:
      AppEntitiesServiceProxy,
     
  ) {
    super(injector);
  }

//   get basicInfoFields(): any[] {
//     return [
//       {
//         key: 'name',
//         label: 'Name',
//         type: 'text',
//         valuePath: 'branch.name'
//       },
//       {
//         key: 'code',
//         label: 'Code',
//         type: 'text',
//         valuePath: 'branch.code',
//         readonly:
//           this.mode !== 'create'
//       },
//       {
//         key: 'ssin',
//         label: 'SSIN',
//         type: 'text',
//         valuePath: 'branch.ssin',
//         readonly: true
//       },
//       {
//         key: 'status',
//         label: 'Status',
//         type: 'dropdown',
//         valuePath: 'branch.status',
//         options: [
//           {
//             label: this.l('Active'),
//             value: true
//           },
//           {
//             label: this.l('Inactive'),
//             value: false
//           }
//         ],
//         optionLabel: 'label',
//         optionValue: 'value'
//       }
//     ];
//   }



  private loadLookups(): void {
    forkJoin({
      phoneTypes:
        this._appEntitiesService
          .getAllPhoneTypeForTableDropdown(),

      languages:
        this._appEntitiesService
          .getAllLanguageForTableDropdown(),

      currencies:
        this._appEntitiesService
          .getAllCurrencyForTableDropdown()
    }).subscribe({
      next: result => {
        this.allPhoneTypes =
          result.phoneTypes ?? [];

        this.allLanguages =
          result.languages ?? [];

        this.allCurrencies =
          result.currencies ?? [];
      },
      error: error => {
        console.error(
          'Failed to load branch lookups:',
          error
        );
      }
    });
  }

  private loadBranch(
    branchId: number
  ): void {
    this.loading = true;
    this.showMainSpinner();

    this._accountsService
      .getBranchForEdit(branchId)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.hideMainSpinner();
        })
      )
      .subscribe({
        next: result => {
          this.entity =
            result;

          this.entity.contactAddresses ??=
            [];

          this.entityData = {
            branch: this.entity
          };

          this.entityChange.emit(
            this.entityData
          );
        },

        error: error => {
          console.error(
            'Failed to load branch:',
            error
          );

          this.notify.error(
            this.l('FailedToLoadBranch')
          );
        }
      });
  }

  private initializeCreateMode():
    void {
    this.entity =
      new BranchDto();

    this.entity.id = undefined;

    this.entity.accountId =
      Number(
        this.node?.context?.accountId
      ) || undefined;

    this.entity.parentId =
      Number(
        this.node?.parentId
      ) || undefined;

    this.entity.contactAddresses =
      [];

    this.entityData = {
      branch: this.entity
    };

    this.mode = 'create';
  }

  editEntity(): void {
    this.backup =
      BranchDto.fromJS(
        this.entity.toJSON()
      );

    this.mode = 'edit';
  }

  cancelEntity(): void {
    if (this.backup) {
      this.entity =
        BranchDto.fromJS(
          this.backup.toJSON()
        );

      this.entityData = {
        branch: this.entity
      };
    }

    this.mode = 'view';

    this.cancelled.emit();
  }

//   saveEntity(): void {
//     if (this.saving) {
//       return;
//     }

//     this.entity.contactAddresses ??=
//       [];

//     this.saving = true;
//     this.showMainSpinner();

//     this._accountsService
//       .createOrEditBranch(
//         this.entity
//       )
//       .pipe(
//         finalize(() => {
//           this.saving = false;
//           this.hideMainSpinner();
//         })
//       )
//       .subscribe({
//         next: result => {
//           this.notify.success(
//             this.l('SavedSuccessfully')
//           );

//           this.mode = 'view';

//           this.saved.emit({
//             branch: this.entity,
//             result
//           });

//           const savedId =
//             this.entity.id ??
//             result?.id;

//           if (savedId) {
//             this.loadBranch(
//               Number(savedId)
//             );
//           }
//         },

//         error: error => {
//           console.error(
//             'Failed to save branch:',
//             error
//           );

//           this.notify.error(
//             this.l('SaveFailed')
//           );
//         }
//       });
//   }

  onEntityDataChanged(
    changedData: any
  ): void {
    this.entityData =
      changedData;

    this.entity =
      changedData?.branch ??
      this.entity;

    this.entityChange.emit(
      this.entityData
    );
  }

  get isViewMode(): boolean {
    return this.mode === 'view';
  }

loadEntity(): void {
  const branchId =
    Number(this.node?.id);

  if (
    !branchId ||
    this.loading
  ) {
    return;
  }

  this.loading = true;

  this._accountsService
    .getBranchForEdit(branchId)
    .pipe(
      finalize(() => {
        this.loading = false;
      })
    )
    .subscribe({
      next: result => {
        const branch =
          (result as any)?.branch ??
          (result as any)?.accountInfo ??
          result;

        this.entity =
          branch instanceof BranchDto
            ? branch
            : BranchDto.fromJS(branch);

        this.entity.contactAddresses ??=
          [];

        this.entityData = {
          branch: this.entity
        };

        /*
         * Do not emit entityChange here.
         * This is API initialization,
         * not a user field change.
         */
      },

      error: error => {
        console.error(
          'GetBranchForEdit failed:',
          error
        );

        this.notify.error(
          this.l('FailedToLoadBranch')
        );
      }
    });
}

basicInfoFields:
  EntityBasicInfoField[] = [
    {
      key: 'status',
      label: 'Status',
      type: 'dropdown',
      valuePath:
        'branch.status',
      options: [
        {
          label: 'Active',
          value: true
        },
        {
          label: 'Inactive',
          value: false
        }
      ],
      optionLabel: 'label',
      optionValue: 'value',
      editableInCreate: true,
      editableInEdit: true
    },
    {
      key: 'name',
      label: 'Name',
      type: 'text',
      valuePath:
        'branch.name',
      editableInCreate: true,
      editableInEdit: true
    },
    {
      key: 'code',
      label: 'Code',
      type: 'text',
      valuePath:
        'branch.code',
      editableInCreate: true,
      editableInEdit: false
    },
    {
      key: 'ssin',
      label: 'SSIN',
      type: 'text',
      valuePath:
        'branch.ssin',
      readonly: true
    }
  ];



saveEntity(): void {
  if (
    this.saving ||
    !this.entity
  ) {
    return;
  }

  if (!this.entity.name?.trim()) {
    this.notify.warn(
      this.l('NameIsRequired')
    );

    return;
  }

  this.entity.contactAddresses ??= [];

  this.saving = true;
  this.showMainSpinner();

  this._accountsService
    .createOrEditBranch(
      this.entity
    )
    .pipe(
      finalize(() => {
        this.saving = false;
        this.hideMainSpinner();
      })
    )
    .subscribe({
      next: result => {
        this.mode = 'view';

        this.notify.success(
          this.l('SavedSuccessfully')
        );

        /*
         * Inform GenericEntityShellComponent that
         * the branch was saved successfully.
         *
         * Do not call loadEntity() here because
         * AccountCardComponent already refreshes
         * the account tree through
         * dynamicEntitySaved.
         */
        this.saved.emit({
          branch: this.entity,
          result
        });
      },

      error: error => {
        console.error(
          'CreateOrEditBranch failed:',
          error
        );

        this.notify.error(
          this.l('SaveFailed')
        );
      }
    });
}
}