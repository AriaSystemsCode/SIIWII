import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketplaceEventsComponent } from './component/marketplace-events.component';
import { EventsBrowseModule } from '@app/main/AppEventsBrowse/events-browse.module';
import { eventsModule } from '@app/main/AppEvent/events.module';
import { MarketplaceEventsRoutingModule } from './marketplace-events-routing.module';



@NgModule({
  declarations: [MarketplaceEventsComponent],
  imports: [
    CommonModule,
    EventsBrowseModule,
    eventsModule,
    MarketplaceEventsRoutingModule
  ]
})
export class MarketplaceEventsModule { }
