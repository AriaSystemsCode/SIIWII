import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ViewEventComponent } from '@app/main/AppEvent/Components/view-event.component';
import { AppConsts } from '@shared/AppConsts';

@Component({
  selector: 'app-marketplace-event-card',
  templateUrl: './marketplace-event-card.component.html',
  styleUrls: ['./marketplace-event-card.component.scss'],
})
export class MarketplaceEventCardComponent {
  @Input() block: any;                
  @Input() dir: 'rtl' | 'ltr' = 'ltr'; 

  @Output() details = new EventEmitter<any>();
  @ViewChild("viewEventModal", { static: true }) viewEventModal: ViewEventComponent;
  attachmentBaseUrl = AppConsts.attachmentBaseUrl;
    isSmallScreen = false;

  ngOnInit(){

      this.checkScreenSize();
  window.addEventListener('resize', this.checkScreenSize.bind(this));

    }
    checkScreenSize(): void {
  this.isSmallScreen = window.innerWidth <= 1023;
}

  get posterUrl(): string {
    const logo = this.block?.logoURL || this.block?.banarURL;
    if (!logo) return 'assets/placeholders/appitem-placeholder.png';
    return `${this.attachmentBaseUrl}/${logo}`;
  }



  onImgErr(e: Event) {
    (e.target as HTMLImageElement).src = 'assets/placeholders/appitem-placeholder.png';
  }
  openEventDetails(id: any) {

  this.details.emit(id)
        // this.viewEventModal.show(id,0);

  }
}