import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Injector, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import {AppSubscriptionPlanDetailDto, AppSubscriptionPlanDetailsServiceProxy, GetAppSubscriptionPlanDetailForViewDto } from '@shared/service-proxies/service-proxies';
import {AppTenantSubscriptionPlansServiceProxy} from '@shared/service-proxies/service-proxies';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { Observable } from 'rxjs/internal/Observable';
import { trigger, transition, style, animate } from '@angular/animations';
import { ProgressComponent } from "@app/shared/common/progress/progress.component";
import { forEach } from 'lodash';
import { left } from '@devexpress/analytics-core/analytics-elements-metadata';

@Component({
  selector: 'app-add-ons',
  templateUrl: './add-ons.component.html',
  styleUrls: ['./add-ons.component.scss']
})
export class AddOnsComponent extends AppComponentBase implements AfterViewInit  {
  @ViewChild("ProgressModal", { static: true }) 
  ProgressModal: ProgressComponent;
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;
  @ViewChildren('outerprogressbar') outerprogressbar!: QueryList<ElementRef>;
  @ViewChildren('innerprogressbar') innerprogressbar!: QueryList<ElementRef>;
  @ViewChildren('zerolabel') zerolabel!: QueryList<ElementRef>;
  @ViewChildren('totallabel') totallabel!: QueryList<ElementRef>;
  @ViewChildren('progresslabel') progresslabel!: QueryList<ElementRef>;
  @ViewChildren('rowreference') rowreference: QueryList<ElementRef>;
  @ViewChildren('progressvalues') progressvalue: QueryList<ElementRef>;
  @ViewChild('addbtn') addbtn: ElementRef;
  tenantId = this.appSession.tenantId;
  tenantSubscriptionPlanId:Observable<number>;
  progressValue = 50  ;
  progress=0.1;
  
  constructor( injector: Injector,
    private _appSubscriptionPlanDetailsServiceProxy: AppSubscriptionPlanDetailsServiceProxy,
    private _appTenantSubscriptionPlansServiceProxy:AppTenantSubscriptionPlansServiceProxy,
    private el: ElementRef, private renderer: Renderer2)
    {
      super(injector);
      
    }
 /*  ngAfterViewInit(): void {
    throw new Error('Method not implemented.');
  } */
    async ngOnInit()
    {
      this.progress = 0.1;
       
    }
    async getAppTenantAddOns(event?: LazyLoadEvent)
{
  if (this.primengTableHelper.shouldResetPaging(event)) {
    this.paginator.changePage(0);
    //return;
}

this.primengTableHelper.showLoadingIndicator();
  this.tenantSubscriptionPlanId = this._appTenantSubscriptionPlansServiceProxy.getTenantSubscriptionPlanId(this.tenantId);
  var header = await this.tenantSubscriptionPlanId.toPromise();
  this._appSubscriptionPlanDetailsServiceProxy.getAll(
    null,    null,    null,    null,  null ,    null,
    null,    null,    null,    null,    null,    null, null,    null, 
    null,    null, null,    null,
    null,  header,  null,   true,null,     0,    100).subscribe(result => {
    this.primengTableHelper.totalRecordsCount = result.totalCount;
    this.primengTableHelper.records = result.items;
    this.primengTableHelper.hideLoadingIndicator();
    //this.cdr.detectChanges();
});

} 
reloadPage(): void {
  this.paginator.changePage(this.paginator.getPage());
}
add(inputRow: GetAppSubscriptionPlanDetailForViewDto){

  //this.onShowSideBar(true);
  this.showSideBar = true;
  //this.addbtn.nativeElement.disabled = true;
}

showSideBar; 
//showHideSideBarTitle;
onShowSideBar(showSideBar:boolean)
{

  this.showSideBar = showSideBar;
  //this.showHideSideBarTitle = !this.showSideBar ? "Summary" : "Hide Summary";
}
getProgressBarWidth(inputRow: GetAppSubscriptionPlanDetailForViewDto)
{
  var widthCalc = 1;
  if (inputRow.featureCreditQty!=0)
     widthCalc = (inputRow.featureUsedQty/inputRow.featureCreditQty) *100;
  
  return {'width.%': widthCalc};
}

ngAfterViewInit()
{}
ngAfterViewChecked(): void {
  //return;
  if (this.rowreference && this.rowreference.length>0
    && this.progresslabel && this.progresslabel.length>0 && this.zerolabel
    && this.zerolabel.length>0 && this.totallabel &&  this.totallabel.length>0)
  {
    this.rowreference.forEach((row, indexrow) => {

       this.progressvalue.toArray()[indexrow].nativeElement.left=this.outerprogressbar.toArray()[indexrow].nativeElement.left;       
       this.renderer.setStyle(this.progressvalue.toArray()[indexrow].nativeElement,'left','0px');
   // const progressbarObj =   this.innerprogressbar[indexrow];
   // if(progressbarObj)
   // {
      //const progressbarObj =   row.nativeElement.children.getElementsByClassName('progress-bar');
      //const el1Right =  this.innerprogressbar[indexrow].nativeElement.getBoundingClientRect().right;
       if (this.progresslabel.toArray()[indexrow])
       {
        this.renderer.setStyle(this.progresslabel.toArray()[indexrow].nativeElement, 'font-size', '7px');
        this.progresslabel.toArray()[indexrow].nativeElement.left= this.innerprogressbar.toArray()[indexrow].nativeElement.getBoundingClientRect().right;//-this.outerprogressbar.toArray()[indexrow].nativeElement.getBoundingClientRect().width;
       }
      if(this.zerolabel.toArray()[indexrow])
      {
      this.zerolabel.toArray()[indexrow].nativeElement.left=0; //this.outerprogressbar.toArray()[indexrow].nativeElement.getBoundingClientRect().left;    ;
      this.renderer.setStyle(this.zerolabel.toArray()[indexrow].nativeElement, 'font-size', '7px');
      
      }
      if(this.totallabel.toArray()[indexrow])
      {
      this.totallabel.toArray()[indexrow].nativeElement.left= this.outerprogressbar.toArray()[indexrow].nativeElement.getBoundingClientRect().right;//-this.outerprogressbar.toArray()[indexrow].nativeElement.getBoundingClientRect().width; 
      this.renderer.setStyle(this.totallabel.toArray()[indexrow].nativeElement, 'font-size', '7px');
      }
   

  });
}
}
}
