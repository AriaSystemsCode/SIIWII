import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { AppItemsBrowseModalComponent } from '@app/main/app-items/app-items-browse/components/app-items-browse-modal.component';
import { MultiSelectionInfo } from '@app/main/app-items/app-items-browse/models/multi-selection-info.model';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppItemsServiceProxy } from '@shared/service-proxies/service-proxies';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-app-items-multi-selection-demo',
  templateUrl: './app-items-multi-selection-demo.component.html',
  styleUrls: ['./app-items-multi-selection-demo.component.scss']
})
export class AppItemsMultiSelectionDemoComponent extends AppComponentBase implements OnInit {
  @ViewChild("appItemsBrowseModal", { static: true }) appItemsBrowseModal: AppItemsBrowseModalComponent;
  key: string
  constructor(
    injector: Injector,
    private _appItemsServiceProxy: AppItemsServiceProxy
  ) {
    super(injector);
  }
  ngOnInit(): void {
    this.key = this.guid()
  }
  applyHandler({ multiSelectionInfo, totalCount }: { multiSelectionInfo: MultiSelectionInfo, totalCount: number }) {
    this.showMainSpinner()
    this._appItemsServiceProxy
      .getAll(
        0,undefined,
        true,
        undefined,
        0,
        undefined,
        multiSelectionInfo.sessionSelectionKey,
        undefined,//priceListId
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        0,
        0,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        0,
        totalCount
      ).pipe(
        finalize(() => {
          this.hideMainSpinner()
        })
      )
      .subscribe(res => {
        this.primengTableHelper.records = res.items
      })
  }
  cancelHandler() {
    this.appItemsBrowseModal.close()
  }
  showBrowseModal(){
    const multiSelectionInfo : MultiSelectionInfo = new MultiSelectionInfo()
    multiSelectionInfo.sessionSelectionKey = this.key
    this.appItemsBrowseModal.show(multiSelectionInfo)
  }

}
