import { Component, EventEmitter, inject, Injector, Input, OnChanges, Output, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
  selector: 'app-app-side-bar',
  templateUrl: './app-side-bar.component.html',
  styleUrls: ['./app-side-bar.component.scss']
})
export class AppSideBarComponent extends AppComponentBase implements OnChanges {

  @Input() entityTypeName = "";
  @Input() id: string;
  @ViewChild('dynamicComponentContainer', { read: ViewContainerRef }) dynamicComponentContainer: ViewContainerRef;
  componentFound: boolean = false;
  @Output("hideSideBar") hideSideBar: EventEmitter<boolean> = new EventEmitter<boolean>();
  dynamicComp: any;
  viewContainerRef = inject(ViewContainerRef);
  constructor(private injector: Injector) {
    super(injector);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.componentFound = false;
    if (this.entityTypeName)
      this.loadDynamicComponent();
  }



  async loadDynamicComponent() {
    try {
      const componentName = "app-" + this.entityTypeName + "-side-bar";
     // const componentclass = `App${componentName}SideBarComponent`;
    
     const { defultSideBar } = await import(`../../../admin/sideBarComponents/${componentName}/${componentName}.component`);
      this.dynamicComp = this.viewContainerRef.createComponent(defultSideBar);
     (this.dynamicComp.instance as { id: string }).id = this.id;
     this.dynamicComp.instance.hideSideBar.subscribe((output) => {;
      this.onhideSideBar();
    });
      this.componentFound=true;
    }
    catch (error) {
      console.error('Error loading dynamic component:', error);
      this.componentFound = false;
    }
  }

  onhideSideBar() {
    this.hideSideBar.emit(true);
  }
}


