import { ChangeDetectorRef, Component, EventEmitter, Injector, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';

import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'app-dynamicInputs-view',
    templateUrl: './dynamic-inputs-view.component.html',
    styleUrls: ['./dynamic-inputs-view.component.scss'],

})
export class dynamicInputsView   extends AppComponentBase implements OnInit {


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
    
}
