import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-connections-tab',
  templateUrl: './connections-tab.component.html',
  styleUrls: ['./connections-tab.component.scss']
})
export class ConnectionsTabComponent {
  @Input() accountId: number;
  @Input() accountType: string;


}
