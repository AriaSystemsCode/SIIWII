import { Component, ComponentFactoryResolver, EventEmitter, Injector, Input, OnChanges, Output, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
  selector: 'app-app-side-bar',
  templateUrl: './app-side-bar.component.html',
  styleUrls: ['./app-side-bar.component.scss']
})
export class AppSideBarComponent extends AppComponentBase  implements OnChanges {
 

  @Input() entityTypeName="";
  @Input()  id:string;
   @ViewChild('dynamicComponentContainer', { read: ViewContainerRef }) dynamicComponentContainer: ViewContainerRef;
  componentFound: boolean = true;
  @Output("hideSideBar") hideSideBar: EventEmitter<boolean> = new EventEmitter<boolean>();

   

  constructor(private componentFactoryResolver: ComponentFactoryResolver, private injector: Injector) { 
    super(injector);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.entityTypeName)
      this.loadDynamicComponent();
  }



  async loadDynamicComponent() {
    try {
      const componentName = "app-" + this.entityTypeName + "-side-Bar";
      const componenPath = '@app/admin/sideBarComponents/'+componentName+'/'+componentName+'.component';
      const componentModule = await import(componenPath);
      
      const componentType = componentModule[componentName];
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentType);
      const componentRef = componentFactory.create(this.injector);
      (componentRef.instance  as { id: string }).id = this.id;
     this.dynamicComponentContainer.insert(componentRef.hostView);  
          this.componentFound = true;
    }
    catch (error) {
      console.error('Error loading dynamic component:', error);
      this.componentFound = false;
    }
  }

  onhideSideBar(){
    this.hideSideBar.emit(true);
  }
}


