import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-side-bar',
  templateUrl: './appsidebar.component.html',
  styleUrls: ['./appsidebar.component.scss']
})
export class AppsidebarComponent {
@Input() messageEntityType;
}
