import {
  AfterViewInit,
  Component,
  OnDestroy,
  ViewChild
} from '@angular/core';

import {
  Subscription
} from 'rxjs';

import {
  MinimizedEntityItem
} from '@app/shared/entity-shell/models/generic-entity.model';

import {
  EntityWindowManagerService
} from '@app/shared/entity-shell/services/entity-window-manager.service';

import {
  AccountEntityComponent
} from '@app/main/accounts/account-shared/components/account-entity/account-entity.component';


@Component({
  selector: 'app-global-entity-view-host',
  templateUrl: './global-entity-view-host.component.html',
  styleUrls: ['./global-entity-view-host.component.scss']
})
export class GlobalEntityViewHostComponent
  implements AfterViewInit, OnDestroy {


  @ViewChild('accountEntity')
  accountEntity:  AccountEntityComponent;

  private maximizeSubscription: Subscription;
  private activeItem:  MinimizedEntityItem | null =  null;


  constructor(
    private entityWindowManager: EntityWindowManagerService
  ) {}


  ngAfterViewInit(): void {

    this.maximizeSubscription =
      this.entityWindowManager
        .maximize$
        .subscribe(
          item => {

            this.openEntity(
              item
            );

          }
        );
  }


  private openEntity(
    item: MinimizedEntityItem
  ): void {

    if (!item) {
      return;
    }

    if (
      this.activeItem &&
      this.activeItem.key !== item.key
    ) {

      this.minimizeCurrentEntity();
    }


    switch (
      item.entityType
    ) {

      case 'Account':

        this.openAccount(item);
        break;
      // case 'Contact':
      //   break;
      // case 'Branch':
      //   break;
    }
  }


  private openAccount(item: MinimizedEntityItem): void {
    const accountId = Number(item.entityId);
    if (!accountId || !this.accountEntity) {
      return;
    }
    this.activeItem =  item;
    this.entityWindowManager.remove(item.key);
    this.accountEntity.view(accountId);
  }


  private minimizeCurrentEntity():void {
    if (!this.activeItem) {
      return;
    }
    switch (
      this.activeItem.entityType
    ) {

      case 'Account':
        this.accountEntity?.minimizeAccount();
        break;

      case 'Contact':

        break;

      case 'Branch':

        break;
    }
  }


  onAccountMinimized(accountId: number): void {
    this.activeItem = null;
  }

  onAccountClosed(): void {
    this.activeItem =null;
  }

  ngOnDestroy(): void {
    this.maximizeSubscription?.unsubscribe();
  }
}