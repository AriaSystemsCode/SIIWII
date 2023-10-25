import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketplaceNewsComponent } from './component/marketplace-news.component';
import { EventsBrowseModule } from '@app/main/AppEventsBrowse/events-browse.module';
import { NewsBrowseModule } from '@app/main/AppNewsBrowse/news-browse.module';
import { eventsModule } from '@app/main/AppEvent/events.module';
import { MarketplaceNewsRoutingModule } from './marketplace-news-routing.module';


@NgModule({
  declarations: [MarketplaceNewsComponent],
  imports: [
    CommonModule,
    EventsBrowseModule,
    NewsBrowseModule,
    eventsModule,
    MarketplaceNewsRoutingModule
  ]
})
export class MarketplaceNewsModule { }
