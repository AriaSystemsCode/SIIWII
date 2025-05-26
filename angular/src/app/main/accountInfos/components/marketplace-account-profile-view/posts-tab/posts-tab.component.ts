import { Component, Input } from '@angular/core';
import { AccountDto } from '@shared/service-proxies/service-proxies';

@Component({
  selector: 'app-posts-tab',
  templateUrl: './posts-tab.component.html',
  styleUrls: ['./posts-tab.component.scss']
})


export class PostsTabComponent {
  @Input() accountDataForView :AccountDto;
  @Input() fromOverviewTab :boolean = false
 
}
