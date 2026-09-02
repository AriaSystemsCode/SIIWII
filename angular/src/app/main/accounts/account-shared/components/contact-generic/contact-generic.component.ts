import {
    Component,
    EventEmitter,
    Injector,
    Output
} from '@angular/core';

import {
    AccountsServiceProxy,
    AppEntityAttachmentDto,
    AppEntityExtraDataDto,
    CreateOrEditAccountInfoDto,
    SycAttachmentCategoryDto,
    SycIdentifierDefinitionsServiceProxy
} from '@shared/service-proxies/service-proxies';

import {
    finalize,
    switchMap
} from 'rxjs/operators';

import {
    forkJoin,
    Observable,
    of
} from 'rxjs';

import {
    FileUploader,
    FileUploaderOptions
} from 'ng2-file-upload';

import {
    IAjaxResponse,
    TokenService
} from 'abp-ng2-module';

import {
    AppComponentBase
} from '@shared/common/app-component-base';

import {
    AppConsts
} from '@shared/AppConsts';

import {
    EntityBasicInfoField,
    EntityMode,
    GenericEntityEditor,
    GenericEntityNode
} from '@app/shared/entity-shell/models/generic-entity.model';


@Component({
    selector: 'app-contact-generic',
    templateUrl: './contact-generic.component.html',
    styleUrls: ['./contact-generic.component.scss']
})
export class ContactGenericComponent
    extends AppComponentBase
    implements GenericEntityEditor {

    node: GenericEntityNode;

    mode: EntityMode = 'view';

    entity: any = null;
    entityData: any = null;

    loading = false;
    saving = false;

    showMedia = true;
    showAdditionalImages = false;

    logoAttachmentCategory:  SycAttachmentCategoryDto;
    bannerAttachmentCategory: SycAttachmentCategoryDto;

    pendingLogoFile: File | null = null;
    pendingCoverFile:  File | null = null;

    private backup: any = null;

    readonly entityObjectType =  'PERSONAL';


    @Output()
    entityChange =
        new EventEmitter<any>();

    @Output()
    saved =
        new EventEmitter<any>();

    @Output()
    cancelled =
        new EventEmitter<void>();


    basicInfoFields:
        EntityBasicInfoField[] = [

        {
            key: 'status',
            label: 'Status',
            type: 'dropdown',
            valuePath: 'account.status',

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
            key: 'accountType',
            label: 'Account Type',
            type: 'dropdown',
            valuePath:
                'account.accountTypeId',

            options: [
                {
                    label: 'Personal',
                    value: 21
                }
            ],

            optionLabel: 'label',
            optionValue: 'value',

            readonly: true
        },

        {
            key: 'name',
            label: 'Name',
            type: 'text',
            valuePath: 'account.name',

            editableInCreate: true,
            editableInEdit: true
        },

        {
            key: 'code',
            label: 'Code',
            type: 'text',
            valuePath: 'account.code',

            editableInCreate: true,
            editableInEdit: false
        },

        {
            key: 'ssin',
            label: 'SSIN',
            type: 'text',
            valuePath: 'account.ssin',

            readonly: true
        }
    ];


    constructor(
        injector: Injector,
        private _accountsServiceProxy: AccountsServiceProxy,
        private _identifierService:   SycIdentifierDefinitionsServiceProxy,
        private _tokenService: TokenService
    ) {
        super(injector);
    }
    loadEntity(): void {

        if (
            this.node?.context?.create
        ) {
            this.initializeCreate();
            return;
        }

        const id =
            Number(this.node?.id);

        if (!id) {
            return;
        }

        this.loading = true;

        this._accountsServiceProxy
            .getAppContactForView(id)
            .pipe(
                finalize(() => {
                    this.loading = false;
                })
            )
           .subscribe(result => {

    this.entity =
        (result as any)?.contact ??
        (result as any)?.account ??
        result;

    this.entity.entityAttachments ??= [];
    this.entity.imagesUrls ??= [];

    this.entityData = {
        account: this.entity,
        contact: this.entity,

        entityExtraData:
            (result as any)
                ?.entityExtraData ??
            this.entity
                ?.entityExtraData ??
            []
    };

    if (this.node) {
        this.node.data =
            this.entityData;
    }

    this.entityChange.emit(
        this.entityData
    );

    this.mode = 'view';
});
    }

    private initializeCreate(): void {

        const context =
            this.node?.context ?? {};

        this.entity = {
 accountTypeId: 21,
            name: '',
            code: '',

            notes: '',
            eMailAddress: '',

            phone1TypeId: null,
            phone1Number: '',
            phone1Ex: '',

            phone2TypeId: null,
            phone2Number: '',
            phone2Ex: '',

            phone3TypeId: null,
            phone3Number: '',
            phone3Ex: '',

            currencyId:
                context.currencyId ??
                null,

            languageId:
                context.languageId ??
                null,

            accountId:
                Number(
                    context.accountId
                ),

            parentId:
                Number(
                    context.parentId
                ),

  
            useDTOTenant: true,

            entityAttachments: [],
            entityExtraData: [],


            branches: [],

            logoUrl: null,
            coverUrl: null,
  
        };


        this.entityData = {
            account: this.entity,
            contact: this.entity,
            entityExtraData:
                this.entity.entityExtraData
        };


        this.mode = 'create';

        this.pendingLogoFile = null;
        this.pendingCoverFile = null;
        this.loadNextCode();
    }


    private loadNextCode(): void {

        this._identifierService
            .getNextEntityCode(
                this.entityObjectType,
                this.appSession.tenantId
            )
            .subscribe(code => {

                this.entity.code =
                    `C${code}`;

            });
    }


    editEntity(): void {

        if (!this.entity) {
            return;
        }

        this.backup =
            JSON.parse(
                JSON.stringify(
                    this.entity
                )
            );

        this.mode = 'edit';
    }


    cancelEntity(): void {

        if (this.backup) {

            this.entity =
                JSON.parse(
                    JSON.stringify(
                        this.backup
                    )
                );

            this.entityData = {
                ...this.entityData,

                account: this.entity,
                contact: this.entity
            };

        }

        this.pendingLogoFile = null;
        this.pendingCoverFile = null;

        this.mode = 'view';

        this.cancelled.emit();
    }


    // =====================================================
    // MEDIA
    // =====================================================

    onLogoChange(event: any): void {
        this.pendingLogoFile =  event?.file instanceof File  ? event.file  : null;
    }

    onBackgroundChange(event: any): void {
        this.pendingCoverFile = event?.file instanceof File   ? event.file  : null;
    }


    onAttachmentRemove(event: any): void {
        const type =
            String(
                event?.attachmentType ??
                ''
            ).toUpperCase();


        let categoryId: number;


        if (type === 'LOGO') {

            this.pendingLogoFile =
                null;

            this.entity.logoUrl =
                null;

            categoryId =
                Number(
                    this.logoAttachmentCategory
                        ?.id
                );
        }


        if (type === 'BANNER') {

            this.pendingCoverFile =
                null;

            this.entity.coverUrl =
                null;

            categoryId =
                Number(
                    this.bannerAttachmentCategory
                        ?.id
                );
        }


        if (!categoryId) {
            return;
        }


        this.entity.entityAttachments =
            (
                this.entity
                    .entityAttachments ??
                []
            )
            .filter(
                x =>
                    Number(
                        x.attachmentCategoryId
                    ) !==
                    categoryId
            );

    }

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

    if (!this.entity.code?.trim()) {

        this.notify.warn(
            this.l('CodeIsRequired')
        );

        return;
    }

    this.saving = true;

    this.uploadMedia()
        .pipe(

            switchMap(uploaded => {

                this.applyMedia(uploaded);

                const payload =
                    this.buildPayload();

                return this
                    ._accountsServiceProxy
                    .createOrUpdateContact(
                        payload
                    );
            }),

            finalize(() => {
                this.saving = false;
            })

        )
        .subscribe(result => {

            this.notify.success(
                this.l(
                    'SavedSuccessfully'
                )
            );

            this.pendingLogoFile = null;
            this.pendingCoverFile = null;

            const savedContact =
                (result as any)?.contact ??
                (result as any)?.account ??
                result;

            const id =
                Number(
                    savedContact?.id ??
                    (result as any)?.id
                );


            // change component to view mode
            this.mode = 'view';


            this.saved.emit({
                result,
                contact: savedContact,
                id
            });


            if (id) {

                this.node.id = id;

                if (this.node.context) {
                    this.node.context.create = false;
                }

            }

               this.mode = 'view';

    this.saved.emit({
        result,
        contact: savedContact,
        id
    });

    if (id) {
        this.loadEntity();
    }
        });
}

private buildPayload(): CreateOrEditAccountInfoDto {

    const source = this.entity;
    const context = this.node?.context ?? {};
    const isCreate = this.mode === 'create';

    const cleanDto =
        new CreateOrEditAccountInfoDto();


    cleanDto.name =
        source.name?.trim();

    cleanDto.code =
        source.code?.trim();

    cleanDto.notes =
        source.notes ?? '';

    cleanDto.eMailAddress =
        source.eMailAddress ?? '';


    cleanDto.phone1TypeId =
        source.phone1TypeId ?? null;

    cleanDto.phone1Number =
        source.phone1Number ?? '';

    cleanDto.phone1Ex =
        source.phone1Ex ?? '';


    cleanDto.phone2TypeId =
        source.phone2TypeId ?? null;

    cleanDto.phone2Number =
        source.phone2Number ?? '';

    cleanDto.phone2Ex =
        source.phone2Ex ?? '';


    cleanDto.phone3TypeId =
        source.phone3TypeId ?? null;

    cleanDto.phone3Number =
        source.phone3Number ?? '';

    cleanDto.phone3Ex =
        source.phone3Ex ?? '';


    cleanDto.currencyId =
        source.currencyId ??
        context.currencyId ??
        null;

    cleanDto.languageId =
        source.languageId ??
        context.languageId ??
        null;


    cleanDto.accountId =
        source.accountId ??
        context.accountId;

    cleanDto.parentId =
        source.parentId ??
        context.parentId;


    cleanDto.useDTOTenant =
        true;


    cleanDto.entityAttachments =
        source.entityAttachments ?? [];


    // IMPORTANT FIX
  cleanDto.entityExtraData =
    (
        this.entityData?.entityExtraData ??
        source.entityExtraData ??
        []
    )
    .filter(item => {

        const value =
            item.attributeValue;

        // keep lookup values
        if (item.attributeValueId != null) {
            return true;
        }

        // remove empty/null values
        if (
            value === null ||
            value === undefined ||
            value === ''
        ) {
            return false;
        }

        // JOIN-DATE
        if (
            item.attributeId === 707 &&
            value === '0'
        ) {
            return false;
        }

        // USER-ID
        if (
            item.attributeId === 715 &&
            (
                value === 'false' ||
                value === '0'
            )
        ) {
            return false;
        }

        return true;
    })
    .map(item => {

        const dto =
            new AppEntityExtraDataDto();

        dto.attributeId =
            item.attributeId;

        dto.attributeValue =
            item.attributeValue ??
            undefined;

        dto.attributeValueId =
            item.attributeValueId ??
            undefined;

        return dto;
    });

    cleanDto.branches =
        source.branches ?? [];


    if (
        isCreate &&
        context.branchNode
    ) {

        cleanDto.branches = [
            context.branchNode
        ];
    }


    if (!isCreate) {

        cleanDto.id =
            source.id;

        cleanDto.entityId =
            source.entityId;

        cleanDto.ssin =
            source.ssin;
    }


    return cleanDto;
}

    private uploadMedia():
        Observable<any[]> {

        const uploads: any[] =
            [];


        if (
            this.pendingLogoFile &&
            this.logoAttachmentCategory?.id
        ) {

            uploads.push({

                file:
                    this.pendingLogoFile,

                categoryId:
                    this.logoAttachmentCategory
                        .id,

                type:
                    'LOGO'
            });
        }


        if (
            this.pendingCoverFile &&
            this.bannerAttachmentCategory?.id
        ) {

            uploads.push({
                file: this.pendingCoverFile,
                categoryId: this.bannerAttachmentCategory.id,
                type: 'BANNER'
            });
        }


        if (!uploads.length) {
            return of([]);
        }


        return forkJoin(
            uploads.map(
                x =>
                    this.uploadFile(x)
            )
        );
    }


    private uploadFile(
        pending: any
    ): Observable<any> {

        return new Observable(
            observer => {

                const guid =
                    this.guid();


                const uploader =
                    new FileUploader({

                        url:
                            AppConsts
                                .remoteServiceBaseUrl +

                            '/Attachment/UploadFiles'
                    });


                uploader.setOptions({

                    authToken:
                        'Bearer ' +
                        this._tokenService
                            .getToken(),

                    removeAfterUpload:
                        true

                } as FileUploaderOptions);


                uploader
                    .onAfterAddingFile =
                    item => {

                        item.withCredentials =
                            false;
                    };


                uploader.onBuildItemForm =
                    (
                        item,
                        form: FormData
                    ) => {

                        form.append(
                            'guid',
                            guid
                        );
                    };


                uploader.onSuccessItem =
                    (
                        item,
                        response
                    ) => {

                        const parsed:
                            IAjaxResponse =

                            typeof response ===
                                'string'

                                ? JSON.parse(
                                    response
                                )

                                : response;


                        if (
                            !parsed?.success
                        ) {

                            observer.error(
                                parsed?.error
                            );

                            return;
                        }


                        const result: any =
                            parsed.result ?? {};


                        const attachment =
                            new AppEntityAttachmentDto();


                        attachment.init({

                            guid:
                                result.guid ??
                                guid,

                            fileName:
                                result.fileName ??
                                pending.file.name,

                            url:
                                result.url ??
                                result.fileName,

                            attachmentCategoryId:
                                pending.categoryId
                        });


                        observer.next({

                            type:
                                pending.type,

                            attachment
                        });


                        observer.complete();
                    };


                uploader.addToQueue([
                    pending.file
                ]);

                uploader.uploadAll();
            }
        );
    }


    private applyMedia(
        uploaded: any[]
    ): void {

        this.entity.entityAttachments ??=
            [];


        uploaded.forEach(item => {

            const categoryId =
                Number(
                    item.attachment
                        .attachmentCategoryId
                );


            this.entity
                .entityAttachments =

                this.entity
                    .entityAttachments

                    .filter(
                        x =>
                            Number(
                                x.attachmentCategoryId
                            ) !==
                            categoryId
                    );


            this.entity
                .entityAttachments
                .push(
                    item.attachment
                );


            if (
                item.type ===
                'LOGO'
            ) {

                this.entity.logoUrl =
                    item.attachment.url;
            }


            if (
                item.type ===
                'BANNER'
            ) {

                this.entity.coverUrl =
                    item.attachment.url;
            }
        });

    }

}