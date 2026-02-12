import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ViewEventComponent } from '@app/main/AppEvent/Components/view-event.component';
import { AppConsts } from '@shared/AppConsts';

@Component({
  selector: 'app-marketplace-event-card',
  templateUrl: './marketplace-event-card.component.html',
  styleUrls: ['./marketplace-event-card.component.scss'],
})
export class MarketplaceEventCardComponent {
  @Input() block: any;                 // PageSettingDto (EVENT block)
  @Input() dir: 'rtl' | 'ltr' = 'ltr'; // for RTL/LTR only

  @Output() details = new EventEmitter<any>();
  @ViewChild("viewEventModal", { static: true }) viewEventModal: ViewEventComponent;
  attachmentBaseUrl = AppConsts.attachmentBaseUrl;

  /** Normalize: block may contain event in different shapes */
  get ev(): any {
    return (
      this.block?.appEvent ||                               // if block itself is GetAppEventForViewDto
      this.block?.getAppEventForViewDto?.appEvent ||        // if block wraps dto
      this.block?.getAppEventForViewDto ||                  // if dto already appEvent-like
      null
    );
  }

  get posterUrl(): string {
    const logo = this.ev?.logoURL || this.ev?.banarURL;
    if (!logo) return 'assets/placeholders/appitem-placeholder.png';
    return `${this.attachmentBaseUrl}/${logo}`;
  }

  get startText(): string {
    return this.ev?.fromDate ? new Date(this.ev.fromDate).toDateString() : '';
  }

  get endText(): string {
    return this.ev?.toDate ? new Date(this.ev.toDate).toDateString() : '';
  }

  onDetailsClick() {
    // emit normalized event object
    this.details.emit(this.ev);
  }

  onImgErr(e: Event) {
    (e.target as HTMLImageElement).src = 'assets/placeholders/appitem-placeholder.png';
  }
  openEventDetails(id: any) {
  
        this.viewEventModal.show(id,0);
 
    console.log('event details', id);
  }
}