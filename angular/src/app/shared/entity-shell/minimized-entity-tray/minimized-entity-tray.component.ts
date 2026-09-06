import {
  Component
} from '@angular/core';

import {
  EntityWindowManagerService,
  MinimizedEntityItem
} from '../services/entity-window-manager.service';


@Component({
  selector: 'app-minimized-entity-tray',
  templateUrl: './minimized-entity-tray.component.html',
  styleUrls: ['./minimized-entity-tray.component.scss']
})
export class MinimizedEntityTrayComponent {

  items$ =
    this.entityWindowManager.items$;


  constructor(
    private entityWindowManager:
      EntityWindowManagerService
  ) {}


  maximize(
    item: MinimizedEntityItem
  ): void {

    this.entityWindowManager
      .maximize(item);
  }


  close(
    event: MouseEvent,
    item: MinimizedEntityItem
  ): void {

    event.stopPropagation();

    this.entityWindowManager
      .remove(item.key);
  }


  closeAll(): void {

    this.entityWindowManager
      .closeAll();
  }
}