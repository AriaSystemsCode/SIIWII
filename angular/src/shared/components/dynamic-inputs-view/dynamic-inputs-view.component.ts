import { ChangeDetectorRef, Component, EventEmitter, Injector, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';

import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'app-dynamicInputs-view',
    templateUrl: './dynamic-inputs-view.component.html',
    styleUrls: ['./dynamic-inputs-view.component.scss'],

})
export class dynamicInputsView   extends AppComponentBase implements OnInit {


    @Input("entityData") entityData: any;
    @Input("extraAttributeObject") extraAttributeObject;
    // @Input("canChange") canChange: boolean = true;

    // @Output("onshowSaveBtn") onshowSaveBtn: EventEmitter<boolean> = new EventEmitter<boolean>()


    usageTypeAttributeMap: { [key: string]: any[] } = {};
  constructor(
    injector: Injector,
    private cdr: ChangeDetectorRef,

  ) {
    super(injector);

  }


 
      
    ngOnChanges(changes: SimpleChanges): void {
    }
     
      


      
   
  
  
  ngOnInit(): void {


    }
    
    prepareUsageTypeAttributeMap() {
      const attributes = this.entityData?.extraDataAttributes || [];

      this.usageTypeAttributeMap = attributes.reduce((map, attr) => {
          if (!map[attr.extraAttrUsage]) {
              map[attr.extraAttrUsage] = [];
          }
          map[attr.extraAttrUsage].push(attr);
          return map;
      }, {});
  }

  formatUsage(value: string): string {
    return value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : '';
  }
  

}
