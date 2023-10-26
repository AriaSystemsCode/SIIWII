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

    ngOnInit(): void {
        if (!this.publishItemOptions)
            this.publishItemOptions = new PublishItemOptions();
        if (!this.publishItemOptions.itemSharing)
            this.publishItemOptions.itemSharing = [];
        if (!this.publishItemOptions.sharingLevel)
            this.publishItemOptions.sharingLevel = 1;
    }

    publishListing() {
        const publishItemOptions = PublishItemOptions.fromJS(
            this.publishItemOptions
        );
        publishItemOptions.itemSharing.map((item) => {
            if (item.sharedUserId) {
                item.sharedUserName = undefined;
                item.sharedUserSureName = undefined;
                item.sharedUserTenantName = undefined;
            }
            return item;
        });
        this.publishItemOptions = publishItemOptions;
        // api body request incase of product details page
        let SharingBody: any = {
            appItemId: this.PublishAppItemListingService.productId,
            sharingLevel: this.publishItemOptions.sharingLevel,
            message:
                this.publishItemOptions.message &&
                this.publishItemOptions.message !== null
                    ? this.publishItemOptions.message
                    : null,
            itemSharing: this.publishItemOptions.itemSharing,
            Syncproduct: false,
        };
        // api body request incase of product list page
        let productListSharingBody: any = {
            appMarketplaceItemId: null,
            itemListId: this.PublishAppItemListingService.productId,
            sharingLevel: this.publishItemOptions.sharingLevel,
            message:
                this.publishItemOptions.message &&
                this.publishItemOptions.message !== null
                    ? this.publishItemOptions.message
                    : null,
            itemSharing: this.publishItemOptions.itemSharing,
            syncProductList: false,
        };
        // this.savingDone = true
        console.log(">>", this.PublishAppItemListingService.sharingLevel);
        this.showMainSpinner();
        if (
            this.PublishAppItemListingService.sharingLevel === 0 ||
            this.PublishAppItemListingService.sharingLevel === 3
        ) {
            if (this.PublishAppItemListingService.screen === 1) {
                this.shareProdcut(SharingBody);
            } else {
                this.shareProductList(productListSharingBody);
            }
        } else if (this.PublishAppItemListingService.sharingLevel == 4) {
            this.unhideProduct();
        }

        if (this.PublishAppItemListingService.sharingLevel !== 0) {
            if (this.PublishAppItemListingService.subscribersNumber === 0) {
                if (this.PublishAppItemListingService.screen === 1) {
                    this.makePrivate();
                } else {
                    this.makeListPrivate();
                }
            } else if (
                this.PublishAppItemListingService.subscribersNumber !== 0
            ) {
                this.hideProduct();
            }
        }

        this.currentModalRef.hide();
    }

    unhideProduct() {
        this.appItemsServiceProxy
            .unHideProduct(this.PublishAppItemListingService.productId)
            .pipe(
                finalize(() => {
                    this.hideMainSpinner();
                })
            )
            .subscribe((res: any) => {
                this.PublishAppItemListingService.sharingLevel = 1;
            });
    }

    shareProdcut(sharingOptions: any) {
        this.appItemsServiceProxy
            .shareProduct(sharingOptions)
            .pipe(
                finalize(() => {
                    this.hideMainSpinner();
                    this.notify.success(this.l("shared Successfully"));
                })
            )
            .subscribe((res: any) => {
                this.PublishAppItemListingService.sharingLevel = 1;
            });
    }

    shareProductList(sharingOptions: any) {
        this.AppItemsListsServiceProxy.shareItemList(sharingOptions)
            .pipe(
                finalize(() => {
                    this.hideMainSpinner();
                    this.notify.success(this.l("shared Successfully"));
                })
            )
            .subscribe((res: any) => {
                // this.PublishAppItemListingService.sharingLevel = 1;
                console.log(res);
            });
    }

    // detail page
    makePrivate() {
        this.appItemsServiceProxy
            .makeProductPrivate(this.PublishAppItemListingService.productId)
            .pipe(
                finalize(() => {
                    this.hideMainSpinner();
                })
            )
            .subscribe((res) => {
                this.PublishAppItemListingService.sharingLevel = 3;
            });
    }

    // product list
    makeListPrivate() {
        this.AppItemsListsServiceProxy.makeItemListPrivate(
            this.PublishAppItemListingService.productId
        )
            .pipe(
                finalize(() => {
                    this.hideMainSpinner();
                })
            )
            .subscribe((res) => {
                // this.PublishAppItemListingService.sharingLevel = 3
                console.log(res);
            });
    }

    hideProduct() {
        this.appItemsServiceProxy
            .hideProduct(this.PublishAppItemListingService.productId)
            .pipe(
                finalize(() => {
                    this.hideMainSpinner();
                })
            )
            .subscribe((res) => {
                this.PublishAppItemListingService.sharingLevel = 4;
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

    close() {
        this.currentModalRef.hide();
        this.savingDone = false;
    }
    triggerMessage(value) {
        if (!value) this.publishItemOptions.message = undefined;
    }
}
