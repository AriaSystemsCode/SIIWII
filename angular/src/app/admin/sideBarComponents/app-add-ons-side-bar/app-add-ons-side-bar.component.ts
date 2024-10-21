import { Component, Injector, Input, OnInit, Output , EventEmitter } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
  selector: 'app-add-ons-side-bar',
  templateUrl: './app-add-ons-side-bar.component.html',
  styleUrls: ['./app-add-ons-side-bar.component.scss']
})
export class AppAddOnsSideBarComponent extends AppComponentBase implements OnInit {
  @Input() id = 0;

  @Output("hideSideBar") hideSideBar: EventEmitter<boolean> = new EventEmitter<boolean>();
  
  constructor(
    injector: Injector,
  ) {
    super(injector);
  }
  ngOnInit(): void {

  }
  
}

export class defultSideBar extends AppAddOnsSideBarComponent{}

