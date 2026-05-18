import { Component, EventEmitter, Injector, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import {
  TenantContactMode,
  TenantContactType
} from '@app/main/accountInfos/models/Account-info-page-tabs.enum';
import {

  AccountsServiceProxy,
  GetAccountForViewDto,
  MemberFilterTypeEnum
} from '@shared/service-proxies/service-proxies';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs';
import { ImageObject } from '@app/main/accounts/account-shared/models/imageobject';
import { TenantContactCreateEditComponent } from '../../components/tenant-contact-create-edit/tenant-contact-create-edit.component';
import { MembersListComponent } from '@app/main/members-list/components/members-list/members-list.component';
import { CreateOrEditMemberComponent } from '@app/main/teamMembers/components/create-or-edit-member/create-or-edit-member.component';
import { ViewMemberProfileComponent } from '@app/main/teamMembers/components/view-member-profile/view-member-profile.component';
import { ViewMemberProfileComponentInputsI } from '@app/main/teamMembers/models/view-member-profile-model';
import { MembersListComponentInputsI } from '@app/main/members-list/models/member-list-component-interface';
import { AbpSessionService } from '@node_modules/abp-ng2-module';

@Component({
  selector: 'app-tenant-contact',
  templateUrl: './tenant-contact.component.html',
  styleUrls: ['./tenant-contact.component.scss']
})
export class TenantContactComponent extends AppComponentBase implements OnInit {
  @ViewChild('tenantContactCreateEdit') tenantContactCreateEdit: TenantContactCreateEditComponent;
  @ViewChild('memberListComponent') memberListComponent: MembersListComponent;
  @ViewChild('createOrEditMember') createOrEditMember: CreateOrEditMemberComponent;
  @ViewChild('viewMemberProfile') viewMemberProfile: ViewMemberProfileComponent;

  @Input() mode: TenantContactMode;
  @Input() contactType: TenantContactType;
  @Input() accountId?: number;

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<any>();
  @Output() edit = new EventEmitter<number>();

  TenantContactMode = TenantContactMode;
  TenantContactType = TenantContactType;

  accountData?: GetAccountForViewDto;
  companyLogo: string | null = null;
  coverPhoto: string | null = null;

  attachmentBaseUrl = AppConsts.attachmentBaseUrl;
  currentLang: string
  isArabic: boolean
  activeTabIndex = 0;
  imageObject: ImageObject[] = [];
  selectedMember: { memberId?: number; userId?: number } = {};

  relationId: number = 0;
  roleSeller: boolean = false;
  contactsViewMode: 'list' | 'view' | 'edit' = 'list';
  constructor(injector: Injector, private _accountsServiceProxy: AccountsServiceProxy, private _abpSessionService: AbpSessionService,) {
    super(injector);

  }

  ngOnInit(): void {
    this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName');
    this.isArabic = this.currentLang === 'ar' || this.currentLang === 'ar-EG';

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['accountId'] ||
      changes['mode']
    ) {
      if (this.accountId && this.mode === TenantContactMode.View) {
        this.loadAccountViewData();
      }
    }
  }
  get sidebarData(): any {
    if (
      this.mode === TenantContactMode.Create ||
      this.mode === TenantContactMode.Edit
    ) {
      return this.tenantContactCreateEdit?.accountInfoData ?? null;
    }

    return this.accountData?.account ?? null;
  }

  get isCreateMode(): boolean {
    return this.mode === TenantContactMode.Create;
  }

  get isEditMode(): boolean {
    return this.mode === TenantContactMode.Edit;
  }

  get isViewMode(): boolean {
    return this.mode === TenantContactMode.View;
  }

  loadAccountViewData(): void {
    this.showMainSpinner();

    this.imageObject = [];

    this._accountsServiceProxy
      .getAccountForView(this.accountId, 5)
      .pipe(
        finalize(() => {
          this.hideMainSpinner();
          this.getRelationshipRoles(this._abpSessionService.tenantId, this.accountData?.account.ssin).subscribe(roles => {
            this.roleSeller = (roles || []).some(r =>
              (r.requesterMarketplaceRole || '').toLowerCase().includes('seller') ||
              (r.recipientMarketplaceRole || '').toLowerCase().includes('seller')
            );

          });
        })
      )
      .subscribe((res) => {

        this.accountData = res;
        this.relationId = res.relationId ? res.relationId : 0
        this.companyLogo = this.accountData?.account?.logoUrl
          ? `${this.attachmentBaseUrl}/${this.accountData?.account?.logoUrl}`
          : null;

        this.coverPhoto = this.accountData?.account?.coverUrl
          ? `${this.attachmentBaseUrl}/${this.accountData?.account?.coverUrl}`
          : null;

        /* images slider */
        if (this.accountData?.account?.imagesUrls?.length) {

          this.accountData.account.imagesUrls.forEach((img) => {

            // this.imageObject.push({
            //   image: `${this.attachmentBaseUrl}/${img}`,
            //   thumbImage: `${this.attachmentBaseUrl}/${img}`,
            //   title: ''
            // });
            this.imageObject = (this.accountData?.account?.imagesUrls ?? []).map(img => ({
              image: `${this.attachmentBaseUrl}/${img}`,
              thumbImage: `${this.attachmentBaseUrl}/${img}`,
              title: ''
            }));

          });

        }

      });
  }
  handleSaved(event: any): void {
    this.saved.emit(event);
  }

  openEdit(): void {
    this.mode = TenantContactMode.Edit;
    this.edit.emit(this.accountId);
  }

  openEmail(email: string): void {
    if (!email) return;
    window.location.href = `mailto:${email}`;
  }

  openWebsite(url: string): void {
    if (!url) return;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  }

  switchMode(type: 'view' | 'edit') {
    if (type === 'view') {
      this.mode = TenantContactMode.View;
    } else {
      this.mode = TenantContactMode.Edit;
    }
  }

  reloadViewData(): void {
    if (this.accountId) {
      this.loadAccountViewData();
    }
  }

  submitForm(): void {
    if (this.mode === TenantContactMode.Create || this.mode === TenantContactMode.Edit) {
      this.tenantContactCreateEdit?.save();
    }
  }

  // askToPublish(trueOrFalse) {
  //     if (!trueOrFalse || this.accountLevel == AccountLevelEnum.Manual) return
  //     this.canPublish = true;
  //     this.displaySaveAccount = true
  //     this.saving = false;
  // }



 createOrEditMemberHandler(memberId?: number, userId?: number): void {
  this.contactsViewMode = 'edit';

  setTimeout(() => {
    const accountId = this.accountData?.account?.id || this.accountId;
    const isManualOrExternalContact = true;

    this.createOrEditMember?.show(
      memberId,
      accountId,
      isManualOrExternalContact
    );
  });
}

  viewMemberHandler(event: { memberId: number; userId?: number }): void {
    this.contactsViewMode = 'view';

    setTimeout(() => {
      const memberId = event?.memberId;
      const userId = event?.userId;

      if (!memberId) return;

      const input: ViewMemberProfileComponentInputsI = {
        id: memberId,
        title: 'MemberProfile',
        canDelete: true,
        canEdit: true
      };

      const isManualOrExternalContact = !userId || userId == 0 as any;

      this.viewMemberProfile?.show(input, isManualOrExternalContact);
    });
  }

  reloadMembers(): void {
    this.contactsViewMode = 'list';
    this.membersListLoaded = false;

    setTimeout(() => {
      this.loadMembersList(true);
    });
  }

  private getMemberListInputs(): MembersListComponentInputsI {
    return {
      showMainFiltersOptions: true,
      canAdd: true,
      canView: true,
      defaultMainFilter: MemberFilterTypeEnum.View,
      pageMainFilters: [
        { label: 'Contacts', value: MemberFilterTypeEnum.View }
      ],
      accountId: this.accountData?.account?.id || this.accountId,
      title: 'Contacts'
    };
  }
  membersListLoaded = false;

  openTab(index: number): void {
    const clickedSameContactsTab =
      index === 2 && this.activeTabIndex === 2;

    this.activeTabIndex = index;

    if (index === 2) {
      this.contactsViewMode = 'list';
      this.membersListLoaded = false;

      setTimeout(() => {
        this.loadMembersList(true);
      });

      return;
    }
  }

  loadMembersList(forceReload: boolean = false): void {
    if (!this.memberListComponent) return;

    if (this.membersListLoaded && !forceReload) {
      return;
    }

    this.memberListComponent.show(this.getMemberListInputs());
    this.membersListLoaded = true;
  }

  resetToProfileTab(): void {
    this.activeTabIndex = 0;
    this.membersListLoaded = false;
  }

  memberSaved(event: { memberId: number; userId: number }): void {
    const memberId = event?.memberId;
    const userId = event?.userId;

    if (!memberId) {
      this.reloadMembers();
      return;
    }

    this.contactsViewMode = 'view';

    setTimeout(() => {
      this.viewMemberHandler({ memberId, userId });
    });
  }

  handleMemberProfileEdit(event: any): void {
  const memberId = typeof event === 'number'
    ? event
    : event?.memberId;

  const userId = event?.userId;

  if (!memberId) return;

  this.createOrEditMemberHandler(memberId, userId);
}
}