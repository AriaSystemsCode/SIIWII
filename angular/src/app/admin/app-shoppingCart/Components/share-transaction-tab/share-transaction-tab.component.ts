import { Component, EventEmitter, Injector  } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
  selector: 'app-share-transaction-tab',
  templateUrl: './share-transaction-tab.component.html',
  styleUrls: ['./share-transaction-tab.component.scss']
})
export class ShareTransactionTabComponent  extends AppComponentBase{
  searchContact:string;
  emailList:string;
  constructor(
    injector: Injector,
  ) {
    super(injector);
  }
  ngOnInit(): void {

  }
}
