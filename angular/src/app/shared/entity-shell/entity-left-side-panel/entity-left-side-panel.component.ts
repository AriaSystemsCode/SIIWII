import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { GenericEntityNode } from '../models/generic-entity.model';

@Component({
  selector: 'app-entity-left-side-panel',
  templateUrl: './entity-left-side-panel.component.html',
  styleUrls: ['./entity-left-side-panel.component.scss']
})
export class EntityLeftSidePanelComponent implements OnChanges {

  @Input() collapsed = false;

  @Output() toggle = new EventEmitter<void>();

  @Output() add = new EventEmitter<string>();

  @Input()
  sections: Array<{
    key: string;
    title: string;
    items: GenericEntityNode[];
  }> = [];

  @Output()
  itemSelect =
    new EventEmitter<GenericEntityNode>();

  treeNodes: TreeNode[] = [];
  searchText = '';

  ngOnChanges(changes: SimpleChanges): void {
    this.treeNodes = this.sections.map(section => ({
      label: section.title,
      key: section.key,
      expanded: true,
      data: section,
      children: (section.items || []).map(item => this.mapToTreeNode(item))
    }));
  }

  mapToTreeNode(
    item: GenericEntityNode
  ): TreeNode {
    return {
      label: item.label,

      key:
        `${item.entityType}-${item.id}`,

      data: item,

      icon: item.icon,

      expanded:
        item.expanded ?? false,

      children:
        (item.children ?? [])
          .map(child =>
            this.mapToTreeNode(child)
          )
    };
  }

  onToggle(): void {
    this.toggle.emit();
  }

  onNodeSelect(event: any): void {
    const node = event.node;

    if (node?.data?.isAdd) {
      this.add.emit(node.data.sectionKey);
      return;
    }

    this.itemSelect.emit(node.data);
  }
}