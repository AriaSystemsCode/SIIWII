import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MarketplaceContactsRoutingModule } from './marketplace-contacts-routing.module';
import { MembersListSharedModule } from '@app/main/members-list/members-list-shared.module';
import { MyMembersModule } from '@app/main/teamMembers/my-members.module';
import { MarketplaceContactsComponent } from './components/marketplace-contacts.component';
import { MarketplaceViewContactComponent } from './components/marketplace-view-contact.component';


@NgModule({
  declarations: [
      MarketplaceContactsComponent,
      MarketplaceViewContactComponent
    ],
  imports: [
    CommonModule,
    MarketplaceContactsRoutingModule,
    MembersListSharedModule,
    MyMembersModule
  ]
})
export class MarketplaceContactsModule { }
