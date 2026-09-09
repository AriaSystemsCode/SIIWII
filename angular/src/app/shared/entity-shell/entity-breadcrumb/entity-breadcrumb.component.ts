import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';


@Component({
  selector: 'app-entity-breadcrumb',
  templateUrl: './entity-breadcrumb.component.html',
  styleUrls: ['./entity-breadcrumb.component.scss']
})
export class EntityBreadcrumbComponent {

  @Input()
  items: any[] = [];


  @Output()
  itemClick =
    new EventEmitter<any>();


  onItemClick(
    item: any
  ): void {

    console.log(
      'BREADCRUMB SELECT:',
      item
    );

    this.itemClick.emit(item);
  }
}