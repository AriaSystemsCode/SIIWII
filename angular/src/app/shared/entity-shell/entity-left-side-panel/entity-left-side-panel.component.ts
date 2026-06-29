import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EntityLeftPanelItem, EntityLeftPanelSection } from '../models/generic-entity.model';

@Component({
  selector: 'app-entity-left-side-panel',
  templateUrl: './entity-left-side-panel.component.html',
  styleUrls: ['./entity-left-side-panel.component.scss']
})
export class EntityLeftSidePanelComponent {
  @Input() sections: EntityLeftPanelSection[] = [];
  @Input() collapsed = false;

  @Output() toggle = new EventEmitter<void>();
  @Output() add = new EventEmitter<string>();
  @Output() itemSelect = new EventEmitter<EntityLeftPanelItem>();

  isOpen = true;
  searchText = '';

  togglePanel(): void {
    this.isOpen = !this.isOpen;
  }

  onAdd(sectionKey: string): void {
    this.add.emit(sectionKey);
  }
  onToggle(): void {
    this.toggle.emit();
  }
  onSelect(item: EntityLeftPanelItem): void {
    this.itemSelect.emit(item);
  }
}