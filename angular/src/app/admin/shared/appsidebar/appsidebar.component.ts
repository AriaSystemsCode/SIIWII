import { Component, ComponentFactoryResolver, Injector, Input, OnChanges, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';


@Component({
  selector: 'app-appsidebar',
  templateUrl: './appsidebar.component.html',
  styleUrls: ['./appsidebar.component.scss']
})
export class AppsidebarComponent extends AppComponentBase  implements OnChanges {

  @Input() entityTypeName="";
  @Input()  id:string;
  // @ViewChild('dynamicComponentContainer', { read: ViewContainerRef }) dynamicComponentContainer: ViewContainerRef;
  componentFound: boolean = true;
  

  constructor(private componentFactoryResolver: ComponentFactoryResolver, private injector: Injector) { 
    super(injector);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.entityTypeName)
      this.loadDynamicComponent();
  }



  async loadDynamicComponent() {
    try {
      const componentName = "app-" + this.entityTypeName + "sideBar";
      const componentModule = await import(`./${componentName}`);
      const componentType = componentModule[componentName];
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentType);
      const componentRef = componentFactory.create(this.injector);
      (componentRef.instance  as { id: string }).id = this.id;
    //  this.dynamicComponentContainer.insert(componentRef.hostView);  
          this.componentFound = true;
    }
    catch (error) {
      console.error('Error loading dynamic component:', error);
      this.componentFound = false;
    }
  }
}

