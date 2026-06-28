import { Component } from '@angular/core';

@Component({
  selector: 'app-entity-right-panel',
  templateUrl: './entity-right-panel.component.html',
  styleUrls: ['./entity-right-panel.component.scss']
})
export class EntityRightPanelComponent {

   activeTab: 'audit' | 'messages' | 'related' = 'audit';
}
