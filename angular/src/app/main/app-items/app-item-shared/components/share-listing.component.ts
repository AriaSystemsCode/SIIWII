import {
    AfterViewInit,
    Component,
    Injector,
    Input,
    OnInit,
} from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import {
    AppItemsListsServiceProxy,
    AppItemsServiceProxy,
    GetUsersForMessageDto,
    ItemSharingDto,
    MessageServiceProxy,
    PublishItemOptions,
    SharingItemOptions,
} from "@shared/service-proxies/service-proxies";
import { BsModalRef } from "ngx-bootstrap/modal";
import { PublishAppItemListingService } from "../services/publish-app-item-listing.service";
import { finalize } from "rxjs";

@Component({
    selector: "app-share-listing",
    templateUrl: "./share-listing.component.html",
    styleUrls: ["./share-listing.component.scss"],
})
export class ShareListingComponent extends AppComponentBase implements OnInit {
    filteredUsers: GetUsersForMessageDto[] = [];
    listingItemId: number;
    alreadypublished: boolean;
    publishItemOptions: PublishItemOptions;
    savingDone: boolean = false;
    active: boolean = true;
    saving: boolean = false;
    loading: boolean;
    _notify: boolean = false;
    buttonText = this.l("ShareAndPublish");
    showCloseText = false;
    subscribers: number;
    private initialSharingLevel: number;
    private initialSharingRecipients = "";
    constructor(
        injector: Injector,
        public currentModalRef: BsModalRef,
        private appItemsServiceProxy: AppItemsServiceProxy,
        private messageServiceProxy: MessageServiceProxy,
        public PublishAppItemListingService: PublishAppItemListingService,
        private AppItemsListsServiceProxy: AppItemsListsServiceProxy
    ) {
        super(injector);
    }

    // ngOnInit(): void {
    //     if (!this.publishItemOptions)
    //         this.publishItemOptions = new PublishItemOptions();
    //     if (!this.publishItemOptions.itemSharing)
    //         this.publishItemOptions.itemSharing = [];
    //     const currentSharingLevel = this.publishItemOptions.sharingLevel !== undefined && this.publishItemOptions.sharingLevel !== null
    //         ? this.publishItemOptions.sharingLevel
    //         : this.PublishAppItemListingService.sharingStatus !== undefined && this.PublishAppItemListingService.sharingStatus !== null
    //             ? this.PublishAppItemListingService.sharingStatus
    //             : 1;
    //     this.publishItemOptions.sharingLevel = currentSharingLevel;
    //     this.PublishAppItemListingService.sharingStatus = currentSharingLevel;

    //     if (this.publishItemOptions.itemSharing !== undefined && this.publishItemOptions.itemSharing !== null) {
    //         this.PublishAppItemListingService.itemSharing = this.publishItemOptions.itemSharing;
    //     } else if (this.PublishAppItemListingService.itemSharing) {
    //         this.publishItemOptions.itemSharing = this.PublishAppItemListingService.itemSharing;
    //     }

    //     this.initialSharingLevel = this.publishItemOptions.sharingLevel;
    //     this.initialSharingRecipients = this.getSharingRecipientsKey(
    //         this.publishItemOptions.itemSharing
    //     );
    // }

  ngOnInit(): void {
    const service = this.PublishAppItemListingService;

    const options = this.publishItemOptions
        ? PublishItemOptions.fromJS(this.publishItemOptions)
        : new PublishItemOptions();

    options.itemSharing = (
        options.itemSharing?.length
            ? options.itemSharing
            : (service.itemSharing || [])
    ).map(item => ItemSharingDto.fromJS(item));

    const currentStatus = Number(service.sharingStatus ?? 0);

    // Shared/Restricted => Restricted
    // Not Shared/Private => Public
    options.sharingLevel = currentStatus === 2 ? 2 : 1;

    this.publishItemOptions = options;

    this.initialSharingLevel = options.sharingLevel;
    this.initialSharingRecipients =
        this.getSharingRecipientsKey(options.itemSharing);

    this._notify = false;
}

    private getSharingRecipientsKey(items: ItemSharingDto[]): string {
        return (items || [])
            .map((item) => {
                if (item.sharedUserId) return `user:${item.sharedUserId}`;
                if (item.sharedTenantId) return `tenant:${item.sharedTenantId}`;
                return `email:${(item.sharedUserEMail || "").trim().toLowerCase()}`;
            })
            .sort()
            .join("|");
    }

    get sharingOptionsChanged(): boolean {
        if (!this.publishItemOptions) return false;
        return this.publishItemOptions.sharingLevel !== this.initialSharingLevel ||
            this.getSharingRecipientsKey(this.publishItemOptions.itemSharing) !==
                this.initialSharingRecipients;
    }

    // publishListing() {
    //     if (this.saving) {
    //         return;
    //     }

    //     this.saving = true;
    //     const publishItemOptions = PublishItemOptions.fromJS(
    //         this.publishItemOptions
    //     );
    //     publishItemOptions.itemSharing.map((item) => {
    //         if (item.sharedUserId) {
    //             item.sharedUserName = undefined;
    //             item.sharedUserSureName = undefined;
    //             item.sharedUserTenantName = undefined;
    //         }
    //         return item;
    //     });
    //     this.publishItemOptions = publishItemOptions;
    //     // api body request incase of product details page
    //     let SharingBody: any = {
    //         appItemId: this.PublishAppItemListingService.productId,
    //         sharingLevel: this.publishItemOptions.sharingLevel,
    //         message:
    //             this.publishItemOptions.message &&
    //             this.publishItemOptions.message !== null
    //                 ? this.publishItemOptions.message
    //                 : null,
    //         itemSharing: this.publishItemOptions.itemSharing,
    //         Syncproduct: false,
    //     };
    //     // api body request incase of product list page
    //     let productListSharingBody: any = {
    //         appMarketplaceItemId: null,
    //         itemListId: this.PublishAppItemListingService.productId,
    //         sharingLevel: this.publishItemOptions.sharingLevel,
    //         message:
    //             this.publishItemOptions.message &&
    //             this.publishItemOptions.message !== null
    //                 ? this.publishItemOptions.message
    //                 : null,
    //         itemSharing: this.publishItemOptions.itemSharing,
    //         syncProductList: false,
    //     };

    //     const currentSharingStatus = this.PublishAppItemListingService.sharingStatus;
    //     const hasSubscribers = this.PublishAppItemListingService.subscribersNumber !== 0;
    //     this.showMainSpinner();
    //     if (currentSharingStatus === 0 || currentSharingStatus === 3 || this.sharingOptionsChanged) {
    //         if (this.PublishAppItemListingService.screen === 1) {
    //             this.shareProdcut(SharingBody);
    //         } else {
    //             this.shareProductList(productListSharingBody);
    //         }
    //     } else if (currentSharingStatus === 4) {
    //         if (this.PublishAppItemListingService.screen === 1) this.unhideProduct();
    //         else this.unhideProductList();
    //     } else if (hasSubscribers) {
    //         if (this.PublishAppItemListingService.screen === 1) this.hideProduct();
    //         else this.hideProductList();
    //     } else if (this.PublishAppItemListingService.screen === 1) {
    //         this.makePrivate();
    //     } else {
    //         this.makeListPrivate();
    //     }

    // }


publishListing(): void {
    if (this.saving || !this.publishItemOptions) {
        return;
    }

    const sharingLevel = Number(
        this.publishItemOptions.sharingLevel
    );

    // Restricted sharing requires at least one recipient
    if (
        sharingLevel === 2 &&
        !this.publishItemOptions.itemSharing?.length
    ) {
        this.notify.error(
            this.l("PleaseSelectAtLeastOneUser")
        );
        return;
    }

    // Copy modal data without changing the original
    const options = PublishItemOptions.fromJS(
        this.publishItemOptions
    );

    // Public sharing should not send recipients or messages
    if (sharingLevel === 1) {
        options.itemSharing = [];
        options.message = undefined;
        this._notify = false;
    }

    // Clean recipient data for the API
    options.itemSharing = (options.itemSharing || []).map(item => {
        const recipient = ItemSharingDto.fromJS(item);

        if (recipient.sharedUserId) {
            recipient.sharedUserName = undefined;
            recipient.sharedUserSureName = undefined;
            recipient.sharedUserTenantName = undefined;
        }

        return recipient;
    });

    const service = this.PublishAppItemListingService;

    // This is the saved status, not the modal selection
    const currentSharingStatus = service.sharingStatus;
    const hasSubscribers = (service.subscribersNumber || 0) > 0;

    const sharingChanged =
        sharingLevel !== this.initialSharingLevel ||
        this.getSharingRecipientsKey(
            this.publishItemOptions.itemSharing
        ) !== this.initialSharingRecipients;

    // Request body for product detail
    const sharingBody: any = {
        appItemId: service.productId,
        sharingLevel: sharingLevel,
        message:
            sharingLevel === 2 && this._notify
                ? (options.message || null)
                : null,
        itemSharing: options.itemSharing,
        Syncproduct: false
    };

    // Request body for product list
    const productListSharingBody: any = {
        appMarketplaceItemId: null,
        itemListId: service.productId,
        sharingLevel: sharingLevel,
        message:
            sharingLevel === 2 && this._notify
                ? (options.message || null)
                : null,
        itemSharing: options.itemSharing,
        syncProductList: false
    };

    this.saving = true;
    this.showMainSpinner();

    // New sharing or changed sharing options
    if (
        currentSharingStatus === 0 ||
        currentSharingStatus === 3 ||
        sharingChanged
    ) {
        if (service.screen === 1) {
            this.shareProdcut(sharingBody);
        } else {
            this.shareProductList(productListSharingBody);
        }

        return;
    }

    // Unhide existing shared product
    if (currentSharingStatus === 4) {
        if (service.screen === 1) {
            this.unhideProduct();
        } else {
            this.unhideProductList();
        }

        return;
    }

    // Hide existing shared product with subscribers
    if (hasSubscribers) {
        if (service.screen === 1) {
            this.hideProduct();
        } else {
            this.hideProductList();
        }

        return;
    }

    // Make existing shared product private
    if (service.screen === 1) {
        this.makePrivate();
    } else {
        this.makeListPrivate();
    }
}

    unhideProduct() {
        this.appItemsServiceProxy
            .unHideProduct(this.PublishAppItemListingService.productId)
            .pipe(
                finalize(() => {
                    this.saving = false;
                    this.hideMainSpinner();
                })
            )
            .subscribe((res: any) => {
                this.PublishAppItemListingService.sharingStatus = 1;
                this.savingDone = true;
                this.currentModalRef.hide();
            });
    }

    unhideProductList() {
        this.AppItemsListsServiceProxy.unHideItemList(this.PublishAppItemListingService.productId)
            .pipe(finalize(() => {
                this.saving = false;
                this.hideMainSpinner();
            }))
            .subscribe(() => {
                this.PublishAppItemListingService.sharingStatus =
                    this.publishItemOptions.itemSharing.length > 0 ? 2 : 1;
                this.savingDone = true;
                this.currentModalRef.hide();
            });
    }

    shareProdcut(sharingOptions: any) {
        this.appItemsServiceProxy
            .shareProduct(sharingOptions)
            .pipe(
                finalize(() => {
                    this.saving = false;
                    this.hideMainSpinner();
                })
            )
            .subscribe((res: any) => {
                this.PublishAppItemListingService.sharingStatus = sharingOptions.sharingLevel;
                this.PublishAppItemListingService.itemSharing = sharingOptions.itemSharing;
                this.savingDone = true;
                this.currentModalRef.hide();
            });
    }

    shareProductList(sharingOptions: any) {
        this.AppItemsListsServiceProxy.shareItemList(sharingOptions)
            .pipe(
                finalize(() => {
                    this.saving = false;
                    this.hideMainSpinner();
                })
            )
            .subscribe((res: any) => {
                this.PublishAppItemListingService.sharingStatus = sharingOptions.sharingLevel;
                this.PublishAppItemListingService.itemSharing = sharingOptions.itemSharing;
                this.savingDone = true;
                this.currentModalRef.hide();
            });
    }

    // detail page
    makePrivate() {
        this.appItemsServiceProxy
            .makeProductPrivate(this.PublishAppItemListingService.productId)
            .pipe(
                finalize(() => {
                    this.saving = false;
                    this.hideMainSpinner();
                })
            )
            .subscribe((res) => {
                this.PublishAppItemListingService.sharingStatus = 3;
                this.savingDone = true;
                this.currentModalRef.hide();
            });
    }

    // product list
    makeListPrivate() {
        this.AppItemsListsServiceProxy.makeItemListPrivate(
            this.PublishAppItemListingService.productId
        )
            .pipe(
                finalize(() => {
                    this.saving = false;
                    this.hideMainSpinner();
                })
            )
            .subscribe((res) => {
                this.PublishAppItemListingService.sharingStatus = 3;
                this.savingDone = true;
                this.currentModalRef.hide();
            });
    }

    hideProduct() {
        this.appItemsServiceProxy
            .hideProduct(this.PublishAppItemListingService.productId)
            .pipe(
                finalize(() => {
                    this.saving = false;
                    this.hideMainSpinner();
                })
            )
            .subscribe((res) => {
                this.PublishAppItemListingService.sharingStatus = 4;
                this.savingDone = true;
                this.currentModalRef.hide();
            });
    }

    hideProductList() {
        this.AppItemsListsServiceProxy.hideItemList(this.PublishAppItemListingService.productId)
            .pipe(finalize(() => {
                this.saving = false;
                this.hideMainSpinner();
            }))
            .subscribe(() => {
                this.PublishAppItemListingService.sharingStatus = 4;
                this.savingDone = true;
                this.currentModalRef.hide();
            });
    }

    usersSearch(querySearch): void {
        if (!querySearch) return;

        const alreadySelected = (user: GetUsersForMessageDto): boolean => {
            const index = this.publishItemOptions.itemSharing.findIndex(
                (item) => String(item.sharedUserId) == user.users.value
            );
            return index > -1;
        };

        this.messageServiceProxy.getAllUsers(querySearch).subscribe((users) => {
            this.filteredUsers = users.filter((user) => {
                return !alreadySelected(user);
            });
        });
    }

    addSharingItem(user: GetUsersForMessageDto, i: number) {
        const itemSharingDto: ItemSharingDto = new ItemSharingDto();
        itemSharingDto.sharedUserId = Number(user.users.value);
        itemSharingDto.sharedUserName = user?.users?.name;
        itemSharingDto.sharedUserSureName = user?.surname;
        itemSharingDto.sharedUserTenantName = user?.tenantName;

        this.publishItemOptions.itemSharing.push(itemSharingDto);

        this.filteredUsers.splice(i, 1);
        this.showCloseText = false;
    }

    removeSharingItem(i: number) {
        this.publishItemOptions.itemSharing.splice(i, 1);
    }

    showCloseButtonText() {
        if (this.publishItemOptions.itemSharing.length === 0)
            this.showCloseText = true;
    }
    hideCloseButtonText() {
        this.showCloseText = false;
    }

    addEmail(querySearchElem: { value: string }) {
        const email = querySearchElem?.value?.trim();
        if (!email) return;
        if (!this.validateEmail(email))
            return this.notify.error(this.l("PleaseEnterAValidEmail"));
        const itemSharingDto: ItemSharingDto = new ItemSharingDto();
        itemSharingDto.sharedUserEMail = email;
        querySearchElem.value = "";
        this.publishItemOptions.itemSharing.push(itemSharingDto);
        this.showCloseText = false;
    }

    validateEmail(email) {
        const regex = this.patterns.email;
        return regex.test(String(email).toLowerCase());
    }

    // close() {
    //     this.currentModalRef.hide();
    //     this.savingDone = false;
    // }
    close(): void {
    if (this.saving) {
        return;
    }

    this.savingDone = false;
    this.currentModalRef.hide();
}
    triggerMessage(value) {
        if (!value) this.publishItemOptions.message = undefined;
    }

    onSharingLevelChange(level: number): void {
    this.publishItemOptions.sharingLevel = level;

    if (level === 1) {
        this._notify = false;
        this.publishItemOptions.message = undefined;
        this.filteredUsers = [];
    }

    this.showCloseText =
        level === 2 &&
        !this.publishItemOptions.itemSharing?.length;
}

get sharingButtonText(): string {
    const status = this.PublishAppItemListingService.sharingStatus;
    const subscribers =
        this.PublishAppItemListingService.subscribersNumber || 0;

    // New product, private product, or modified sharing options
    if (
        status === 0 ||
        status === 3 ||
        this.sharingOptionsChanged
    ) {
        return this.l("Share");
    }

    // Hidden product
    if (status === 4) {
        return this.l("Unhide");
    }

    // Already shared product
    if (status === 1 || status === 2) {
        return subscribers > 0
            ? this.l("Hide")
            : this.l("MakePrivate");
    }

    return this.l("Share");
}
}
