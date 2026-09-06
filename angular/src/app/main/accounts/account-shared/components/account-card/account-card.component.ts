import { Component, EventEmitter, Injector, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AccountLevelEnum, AccountsServiceProxy, AppEntityAttachmentDto, CreateMarketplaceAccountServiceProxy, CreateOrEditAccountInfoDto, GetAccountForViewDto, GetAccountInfoForEditOutput, SycAttachmentCategoryDto } from '@shared/service-proxies/service-proxies';
import {
  FileUploader,
  FileUploaderOptions
} from 'ng2-file-upload';

import {
  IAjaxResponse,
  TokenService
} from 'abp-ng2-module';

import {
  forkJoin,
  Observable,
  of
} from 'rxjs';

import {
  map,
  switchMap, finalize
} from 'rxjs/operators';
import { GenericEntityNode, GenericSelectedEntity, PendingUpload } from '@app/shared/entity-shell/models/generic-entity.model';
import { BranchGenericComponent } from '@app/select-branch/branch-generic/branch-generic.component';
import { AccountSectionsComponent } from '../account-sections/account-sections.component';
import { ContactGenericComponent } from '../contact-generic/contact-generic.component';
import { EntityWindowManagerService } from '@app/shared/entity-shell/services/entity-window-manager.service';
import { AccountEntityComponent } from '../account-entity/account-entity.component';
@Component({
  selector: 'app-account-card',
  templateUrl: './account-card.component.html',
  styleUrls: ['./account-card.component.scss']
})
export class AccountCardComponent extends AppComponentBase implements OnChanges {
  @Input('account') account: GetAccountForViewDto
  @Input('cardsViewMode') cardsViewMode: boolean
  @Input('isHost') isHost: boolean
  @Input('FromLandingPage') FromLandingPage: boolean
  @Output() deleteMe: EventEmitter<boolean> = new EventEmitter<boolean>()
  @Output() disconnectMe: EventEmitter<{ account: GetAccountForViewDto; relation: any }> = new EventEmitter();
  @Input() fromMarketplace;
  @Input() loginTenaneSsin;
  @Output() _createRelation: EventEmitter<any> = new EventEmitter<any>()


  isRecordOwner: boolean
  attachmentBaseUrl: string = AppConsts.attachmentBaseUrl
  currentLang: string
  isArabic: boolean
  isAuthenticated: boolean = false;

  isSmallScreen = false;
  isTouchDevice = false;

  showRelationsDialog = false;
  selectedAccountForRelations: any = null;
  openedRelationMenuId: number | null = null;
  isCreatingRelation = false;

  accountViewData: GetAccountForViewDto | null = null;
  isLoadingAccountView = false;


  logoAttachmentCategory: SycAttachmentCategoryDto;
  bannerAttachmentCategory: SycAttachmentCategoryDto;
  imageAttachmentCategory: SycAttachmentCategoryDto;

  isLoadingAttachmentCategories = false;

  @ViewChild(AccountSectionsComponent)
  accountSectionsComponent:
    AccountSectionsComponent;

  leftPanelSections: Array<{
    key: string;
    title: string;
    type?: 'tree' | 'list';
    canAdd?: boolean;
    items: GenericEntityNode[];
  }> = [];
  constructor(
    injector: Injector,
    private router: Router,
    private _accountsServiceProxy: AccountsServiceProxy,
    private CreateMarketplaceAccountServiceProxy: CreateMarketplaceAccountServiceProxy,
    private _tokenService:
      TokenService,
      private entityWindowManager:
    EntityWindowManagerService,
    
  ) {
    super(injector);
  }




  ngOnInit() {
    this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName')
    this.currentLang == 'ar' || this.currentLang == 'ar-EG' ? this.isArabic = true : this.isArabic = false
    this.isAuthenticated = !!this.appSession?.user;

    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize.bind(this));
    this.loadAttachmentCategories();

  }

  private loadAttachmentCategories(): void {
    if (this.isLoadingAttachmentCategories) {
      return;
    }

    if (
      this.logoAttachmentCategory &&
      this.bannerAttachmentCategory &&
      this.imageAttachmentCategory
    ) {
      return;
    }

    this.isLoadingAttachmentCategories = true;

    this.getSycAttachmentCategoriesByCodes([
      'LOGO',
      'BANNER',
      'IMAGE'
    ])
      .pipe(
        finalize(() => {
          this.isLoadingAttachmentCategories = false;
        })
      )
      .subscribe({
        next: result => {
          const categories =
            result ?? [];

          this.logoAttachmentCategory =
            categories.find(
              item => item.code === 'LOGO'
            );

          this.bannerAttachmentCategory =
            categories.find(
              item => item.code === 'BANNER'
            );

          this.imageAttachmentCategory =
            categories.find(
              item => item.code === 'IMAGE'
            );
        },
      });
  }
  checkScreenSize(): void {
    this.isSmallScreen = window.innerWidth <= 1023;
  }
  ngOnChanges(
    changes: SimpleChanges
  ): void {
    this.isRecordOwner =
      this.account?.account?.partnerId ===
      this.appSession?.user?.accountId;
  }

  get id(): number { return this.account.account.id }
  get isManual(): boolean { return this.account.account.isManual }
  deleteAccount() {
    this.deleteMe.emit()
  }



  edit(): void {
    if (!this.id) return
    let editPrefix = this.isHost ? "external" : "manual"
    this.router.navigate([`/app/main/account/edit-${editPrefix}/${this.id}`])
  }


@ViewChild('accountEntity')
accountEntity:
  AccountEntityComponent;
viewProfile(): void {

  if (!this.id) {
    return;
  }

  this.accountEntity
    .view(
      this.id
    );
}


  clickCardHandler() {
    // if (this.isManual) {
    //   this.edit()
    // } else {
    this.viewProfile()
    // }
  }

  createRelation(relationType: any) {
    if (this.isCreatingRelation) {
      return;
    }

    this.isCreatingRelation = true;

    this._createRelation.emit({
      account: this.account,
      relation: relationType,
      done: () => {
        this.isCreatingRelation = false;
      }
    });
  }
  getFormattedConnectionName(label: string): string {
    if (!label) return '';

    if (label === 'Follow' || label === 'Connect' || label === 'Join' || label === 'Employ') {
      return label;
    }

    if (label.startsWith('MPAction')) {
      const clean = label.replace('MPAction', '');
      return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
    }

    return label;
  }
  removeRelation(account, relation) {
    this.disconnectMe.emit({ account, relation });
  }

  private readonly ICONS: Record<string, string> = {
    FOLLOW: 'assets/accounts/FOLLOW.png',
    CONNECT: 'assets/accounts/CONNECT.png',
    EMPLOY: 'assets/accounts/CONNECT.png',
    EMPLOYEE: 'assets/accounts/EMPLOYEE.png',
    JOIN: 'assets/accounts/JOIN.png',
  };
  getConnectionIcon(label?: string): string {
    const t = (label || '').toUpperCase();
    for (const key of Object.keys(this.ICONS)) {
      if (t.includes(key)) return this.ICONS[key];
    }
    return 'assets/accounts/CONNECT.png'; // fallback
  }

  makeRelationPrivatePublic(relation: any, status: boolean) {
    const accountId = this.account?.account?.ssin;
    if (!accountId || !relation) return;

    this.showMainSpinner();

    this.CreateMarketplaceAccountServiceProxy
      .createOrEditMarketplaceContactRelationship(this.loginTenaneSsin, accountId, false, status, null, relation?.relationEntityId)
      .pipe(
        finalize(() => {
          this.hideMainSpinner();
        })
      )
      .subscribe(() => {
        relation.visibility = relation.visibility === 'Public' ? 'Private' : 'Public';

        relation.visibility === 'Public'
          ? this.notify.success('Account is Shared')
          : this.notify.success('Account is Private');
      });
  }

  getRemainingCategoriesList(categories: string[]): string {
    if (!categories || categories.length <= 3) {
      return '';
    }

    return categories
      .slice(3)
      .map(category => `• ${category}`)
      .join('\n');
  }

  getAccountTypeIcon(type: string): string {
    const accountType = (type || '').toLowerCase();

    if (accountType.includes('business')) {
      return 'fas fa-building';
    }

    if (accountType.includes('group')) {
      return 'fas fa-users';
    }

    if (accountType.includes('personal')) {
      return 'fas fa-user';
    }

    return 'fas fa-tag';
  }

  stopPropagation($event) {
    $event.stopPropagation() // stop click event bubbling
  }

  openRelationsDialog(account: any): void {
    this.selectedAccountForRelations = account;
    this.showRelationsDialog = true;
  }

  removeRelationFromDialog(account: any, relation: any, index: number): void {
    this.removeRelation(account, relation);

    // optional: close dialog if no relations left after UI update
    setTimeout(() => {
      if (!account?.connectionsInfo?.length) {
        this.showRelationsDialog = false;
      }
    });
  }



  toggleRelationMenu(event: MouseEvent, account: any): void {
    event.preventDefault();
    event.stopPropagation();

    const id = account?.account?.id;
    this.openedRelationMenuId = this.openedRelationMenuId === id ? null : id;
  }

  onRelationOptionClick(event: MouseEvent, option: any): void {
    event.preventDefault();
    event.stopPropagation();

    this.createRelation(option);
    this.openedRelationMenuId = null;
  }

}
