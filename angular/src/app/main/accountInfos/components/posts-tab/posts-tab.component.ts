import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-posts-tab',
  templateUrl: './posts-tab.component.html',
  styleUrls: ['./posts-tab.component.scss']
})


export class PostsTabComponent {
  @Input() accountId: number;
  @Input() accountType: string;


}
