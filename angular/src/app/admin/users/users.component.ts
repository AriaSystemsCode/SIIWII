import {
    Component,
    Injector,
    ViewChild,
    ViewEncapsulation,
    AfterViewInit,
    OnInit,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AppConsts } from "@shared/AppConsts";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { AppComponentBase } from "@shared/common/app-component-base";
import {
    EntityDtoOfInt64,
    UserListDto,
    UserServiceProxy,
    PermissionServiceProxy,
    FlatPermissionDto,
    EmailingTemplateServiceProxy,
} from "@shared/service-proxies/service-proxies";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { LazyLoadEvent } from "primeng/api";
import { Paginator } from "primeng/paginator";
import { Table } from "primeng/table";
import { CreateOrEditUserModalComponent } from "./create-or-edit-user-modal.component";
import { EditUserPermissionsModalComponent } from "./edit-user-permissions-modal.component";
import { ImpersonationService } from "./impersonation.service";
import { HttpClient } from "@angular/common/http";
import { FileUpload } from "primeng/fileupload";
import { finalize } from "rxjs/operators";
import { PermissionTreeModalComponent } from "../shared/permission-tree-modal.component";
// import { ManageEntityDynamicParameterValuesModalComponent } from "@app/admin/dynamic-entity-parameters/entity-dynamic-parameter/entity-dynamic-parameter-value/manage-entity-dynamic-parameter-values-modal.component";
import { SendMailModalComponent } from "@app/shared/common/Mail/sendMail-modal.component";
import { Observable } from "rxjs";

@Component({
    templateUrl: "./users.component.html",
    encapsulation: ViewEncapsulation.None,
    styleUrls: ["./users.component.scss"],
    animations: [appModuleAnimation()],
})
export class UsersComponent extends AppComponentBase implements OnInit,AfterViewInit {
    @ViewChild("createOrEditUserModal", { static: true })
    createOrEditUserModal: CreateOrEditUserModalComponent;
    @ViewChild("editUserPermissionsModal", { static: true })
    editUserPermissionsModal: EditUserPermissionsModalComponent;
    @ViewChild("dataTable", { static: true }) dataTable: Table;
    @ViewChild("paginator", { static: true }) paginator: Paginator;
    @ViewChild("ExcelFileUpload", { static: false })
    excelFileUpload: FileUpload;
    @ViewChild("permissionFilterTreeModal", { static: true })
    permissionFilterTreeModal: PermissionTreeModalComponent;
    // @ViewChild("dynamicParametersModal", { static: true })
    // dynamicParametersModal: ManageEntityDynamicParameterValuesModalComponent;
    @ViewChild("sendMailModal", { static: true })
    sendMailModal: SendMailModalComponent;
    mailHeader: string;
    mailsubject: string;
    mailbody: string;
    uploadUrl: string;

    //Filters
    advancedFiltersAreShown = false;
    filterText = "";
    role = "";
    onlyLockedUsers = false;
    isHost:boolean;

    constructor(
        injector: Injector,
        public _impersonationService: ImpersonationService,
        private _userServiceProxy: UserServiceProxy,
        private _fileDownloadService: FileDownloadService,
        private _activatedRoute: ActivatedRoute,
        private _httpClient: HttpClient,
        private _emailingTemplateAppService: EmailingTemplateServiceProxy
    ) {
        super(injector);
        this.filterText =
            this._activatedRoute.snapshot.queryParams["filterText"] || "";
        this.uploadUrl =
            AppConsts.remoteServiceBaseUrl + "/Users/ImportFromExcel";
    }

    ngOnInit() {
           this.isHost = !this.appSession.tenantId;
    }

    ngAfterViewInit(): void {
        this.primengTableHelper.adjustScroll(this.dataTable);
    }

    getUsers(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.totalRecords = 10;
            this.paginator.changePage(0);

            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._userServiceProxy
            .getUsers(
                this.filterText,
                this.permissionFilterTreeModal.getSelectedPermissions(),
                this.role !== "" ? parseInt(this.role) : undefined,
                this.onlyLockedUsers,
                this.primengTableHelper.getSorting(this.dataTable),
                this.primengTableHelper.getMaxResultCount(
                    this.paginator,
                    event
                ),
                this.primengTableHelper.getSkipCount(this.paginator, event)
            )
            .pipe(
                finalize(() => this.primengTableHelper.hideLoadingIndicator())
            )
            .subscribe((result) => {
                this.primengTableHelper.totalRecordsCount = result.totalCount;
                this.primengTableHelper.records = result.items;
                this.primengTableHelper.hideLoadingIndicator();
            });
    }

    unlockUser(record): void {
        this._userServiceProxy
            .unlockUser(new EntityDtoOfInt64({ id: record.id }))
            .subscribe(() => {
                this.notify.success(this.l("UnlockedTheUser", record.userName));
            });
    }

    getRolesAsString(roles): string {
        let roleNames = "";

        for (let j = 0; j < roles.length; j++) {
            if (roleNames.length) {
                roleNames = roleNames + ", ";
            }

            roleNames = roleNames + roles[j].roleName;
        }

        return roleNames;
    }

    reloadPage(): void {
        this.paginator.changePage(this.paginator.getPage());
    }

    exportToExcel(): void {
        this._userServiceProxy
            .getUsersToExcel(
                this.filterText,
                this.permissionFilterTreeModal.getSelectedPermissions(),
                this.role !== "" ? parseInt(this.role) : undefined,
                this.onlyLockedUsers,
                this.primengTableHelper.getSorting(this.dataTable)
            )
            .subscribe((result) => {
                this._fileDownloadService.downloadTempFile(result);
            });
    }

    createUser(): void {
        this.createOrEditUserModal.show();
    }

    uploadExcel(data: { files: File }): void {
        const formData: FormData = new FormData();
        const file = data.files[0];
        formData.append("file", file, file.name);

        this._httpClient
            .post<any>(this.uploadUrl, formData)
            .pipe(finalize(() => this.excelFileUpload.clear()))
            .subscribe((response) => {
                if (response.success) {
                    this.notify.success(this.l("ImportUsersProcessStart"));
                } else if (response.error != null) {
                    this.notify.error(this.l("ImportUsersUploadFailed"));
                }
            });
    }

    onUploadExcelError(): void {
        this.notify.error(this.l("ImportUsersUploadFailed"));
    }

    deleteUser(user: UserListDto): void {
        if (user.userName === AppConsts.userManagement.defaultAdminUserName) {
            this.message.warn(
                this.l(
                    "{0}UserCannotBeDeleted",
                    AppConsts.userManagement.defaultAdminUserName
                )
            );
            return;
        }

          var isConfirmed: Observable<boolean>;
          var message =this.l("UserDeleteWarningMessage", user.userName)
          isConfirmed   = this.askToConfirm(message,"AreYouSure");

         isConfirmed.subscribe((res)=>{
            if(res){
                    this._userServiceProxy.deleteUser(user.id).subscribe(() => {
                        this.reloadPage();
                        this.notify.success(this.l("SuccessfullyDeleted"));
                    });
                }
            }
        );
    }
    ViewProfile(user: UserListDto): void {
        if (user.userName === AppConsts.userManagement.defaultAdminUserName) {
            return;
        }
        this.__router.navigate(["/app/main/account"], {
            queryParams: {
                tab: "ViewMember",
                memberId: user.memberId,
                userId: user.id,
            },
        });
    }
    // showDynamicParameters(user: UserListDto): void {
    //     this.dynamicParametersModal.show(
    //         "onetouch.Authorization.Users.User",
    //         user.id.toString()
    //     );
    // }

    showSendMail() {

        this.mailHeader = "InviteNewUser";
        var emailParameters: string[] = [];
        var tenancyName;
        if (this.appSession?.tenancyName)
            tenancyName = this.appSession?.tenancyName;
        else tenancyName = "Host";
        emailParameters.push(tenancyName);

        emailParameters.push(AppConsts.appBaseUrl);
        emailParameters.push(this.appSession?.user?.name);
        emailParameters.push(this.appSession?.user?.surname);

        var tenantId;
        if (this.appSession?.tenantId)
            tenantId = this.appSession?.tenantId?.toString();
        else tenantId = null;

        emailParameters.push(tenantId);

        this._emailingTemplateAppService
            .getEmailTemplate(
                "InviteNewUser",
                emailParameters,
                abp.localization.currentLanguage.name
            )
            .subscribe((result) => {
                this.mailsubject = result.messageSubject;
                this.mailbody = result.messageBody;

                this.sendMailModal.show(
                    this.mailHeader,
                    this.mailsubject,
                    this.mailbody
                );
            });
    }
}
