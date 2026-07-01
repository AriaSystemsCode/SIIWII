import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { TreeNode } from 'primeng/api';

@Component({
  selector: 'app-entity-left-side-panel',
  templateUrl: './entity-left-side-panel.component.html',
  styleUrls: ['./entity-left-side-panel.component.scss']
})
export class EntityLeftSidePanelComponent implements OnChanges {
  @Input() sections: any[] = [];
  @Input() collapsed = false;

  @Output() toggle = new EventEmitter<void>();
  @Output() itemSelect = new EventEmitter<any>();
  @Output() add = new EventEmitter<string>();

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

  mapToTreeNode(item: any): TreeNode {
    return {
      label: item.label,
      key: String(item.id),
      data: item,
      icon: item.icon,
      expanded: item.expanded || false,
      children: item.children?.map(child => this.mapToTreeNode(child)) || []
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