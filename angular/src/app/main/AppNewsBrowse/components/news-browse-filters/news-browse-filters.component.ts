import { Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FilterMetaData } from '@app/shared/filters-shared/models/FilterMetaData.model';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DisplayNameValueDto, EventsFilterTypesEnum, TimeZoneInfoServiceProxy } from '@shared/service-proxies/service-proxies';
import { SelectItem } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { NewsBrowseComponentFiltersDisplayFlags } from '../../models/NewsBrowseComponentFiltersDisplayFlags';
import * as moment from 'moment';
@Component({
  selector: 'app-news-browse-filters',  
  templateUrl: './news-browse-filters.component.html',
  styleUrls: ['./news-browse-filters.component.scss']
})
export class NewsBrowseFiltersComponent extends AppComponentBase implements OnInit, OnChanges {
    @Input() filterForm : FormGroup
    @Input()  filtersFlags:  NewsBrowseComponentFiltersDisplayFlags
    @Input()  dateErrorMessage:  string
    
    loading:boolean = false
    ItemsFilterTypesEnum = EventsFilterTypesEnum

    timeZonesFilterMetaData:FilterMetaData<SelectItem[]>

    publishStatusFilterMetaData:FilterMetaData<SelectItem[]>
    eventTypeStatusFilterMetaData:FilterMetaData<SelectItem[]>

    get mainFilterCtrl(){ return this.filterForm.get('filterType') }
    get startDateCtrl(){ return this.filterForm.get('startDate') }
    get endDateCtrl(){ return this.filterForm.get('endDate') }

    sortBy : string = 'name'
    @Output() applyFilters = new EventEmitter<void>();
    constructor(
        injector:Injector,
        private _timeZoneInfoServiceProxy : TimeZoneInfoServiceProxy,
    ) {
        super(injector)
    }

    // ngOnInit(): void {
    //     this.timeZonesFilterMetaData = new FilterMetaData<DisplayNameValueDto[]>({list : []})
    //     this.publishStatusFilterMetaData = new FilterMetaData<SelectItem[]>({list : []})
    //     this.eventTypeStatusFilterMetaData = new FilterMetaData<SelectItem[]>({list : []})
    // }
    ngOnInit(): void {
        this.timeZonesFilterMetaData = new FilterMetaData<DisplayNameValueDto[]>({ list: [] });
        this.publishStatusFilterMetaData = new FilterMetaData<SelectItem[]>({ list: [] });
        this.eventTypeStatusFilterMetaData = new FilterMetaData<SelectItem[]>({ list: [] });
      
   
        // if (this.filterForm?.get('dateRange')) {
        //   const sub = this.filterForm.get('dateRange')!.valueChanges.subscribe((range: Date[]) => {
        //     const start = range?.[0] ?? null;
        //     const end = range?.[1] ?? null;
 
        //     if (this.filterForm.get('startDate')) this.filterForm.get('startDate')!.setValue(start, { emitEvent: false });
        //     if (this.filterForm.get('endDate')) this.filterForm.get('endDate')!.setValue(end, { emitEvent: false });
        //   });
      
        //   this.subscriptions.push(sub);
        // }
      }
    ngOnChanges(){
        if(this.mainFilterCtrl){

            this.mainFilterCtrl.valueChanges.subscribe(()=>{
                this.publishStatusFilterMetaData.list = []
                this.eventTypeStatusFilterMetaData.list = []
                this.filterForm.patchValue({
                    publishStatus:undefined,
                    eventTypeStatus:undefined,
                })
            })
        }
    }

    getTimeZonesList(componentRef:{ onListLoadCallback : Function }){
        this.loading = true
        const subs = this._timeZoneInfoServiceProxy.getTimeZonesList()
        .pipe(
            finalize(()=>this.loading = false)
        )
        .subscribe((result)=>{
            const callBackResult: { items : any[], totalCount?:number } = {
                items:result,
                totalCount:result.length
            }
            componentRef.onListLoadCallback(callBackResult);
        })
        this.subscriptions.push(subs)
    }

    getEventTypeOptionsList(componentRef:{ onListLoadCallback : Function }){
        const items =  [
            { label:this.l('Both'), value: undefined},
            { label:this.l('Online'), value:true },
            { label:this.l('InPerson'), value:false },
        ]
        const result: { items : any[], totalCount?:number } = {
            items,
            totalCount:items.length
        }
        componentRef.onListLoadCallback(result);
    }

    getPublishOptionsList(componentRef:{ onListLoadCallback : Function }){
        const items =  [
            { label:this.l('Both'), value: 0 },
            { label:this.l('Published'), value:1 },
            { label:this.l('NotPublished'), value:2 },
        ]
        const result: { items : any[], totalCount?:number } = {
            items,
            totalCount:items.length
        }
        componentRef.onListLoadCallback(result);
    }


    onDateRangeSelect(): void {
        const range = this.filterForm.get('dateRange')?.value as Date[] | null;
        const start = range?.[0] ?? undefined;
        const end = range?.[1] ?? undefined;
    
        // sync silently
        this.filterForm.get('startDate')?.setValue(start, { emitEvent: false });
        this.filterForm.get('endDate')?.setValue(end, { emitEvent: false });
    
        // validate
        if (start && end && moment(start).isAfter(moment(end))) {
          this.dateErrorMessage = this.l('InvalidDateRangeError');
          return;
        }
        this.dateErrorMessage = '';
    
        // apply only when range complete
        if (start && end) {
          this.applyFilters.emit();
        }
      }
    
      onDateRangeClear(): void {
        this.filterForm.get('dateRange')?.setValue(null, { emitEvent: false });
        this.filterForm.get('startDate')?.setValue(undefined, { emitEvent: false });
        this.filterForm.get('endDate')?.setValue(undefined, { emitEvent: false });
        this.dateErrorMessage = '';
    
        this.applyFilters.emit();
      }
    
}

