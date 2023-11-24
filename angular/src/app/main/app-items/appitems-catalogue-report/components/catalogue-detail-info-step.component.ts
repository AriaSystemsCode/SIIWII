import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SelectItem } from 'primeng';
import { ProductCatalogueReportParams } from '../models/product-Catalogue-Report-Params';

@Component({
  selector: 'app-catalogue-detail-info-step',
  templateUrl: './catalogue-detail-info-step.component.html',
  styleUrls: ['./catalogue-detail-info-step.component.scss']
})
export class CatalogueDetailInfoStepComponent implements OnInit {
  @Input() printInfoParam : ProductCatalogueReportParams;
  @Output() continue : EventEmitter<boolean> = new EventEmitter<boolean>()
  @Output() previous : EventEmitter<boolean> = new EventEmitter<boolean>()
  specialPrices: SelectItem[] = [];

  constructor() { }

  ngOnInit(): void {
   this.getSpecialPrices();
  }

  getSpecialPrices(){
    this.specialPrices.push({ label :'A' ,value: 'A'});
    this.specialPrices.push({ label :'B' ,value: 'B'});
    this.specialPrices.push({ label :'C' ,value: 'C'});
    this.specialPrices.push({ label :'D' ,value: 'D'});
  }
  
  
  continueToNextStep(){
    this.continue.emit(true);
}

previousStep(){
  this.previous.emit(true)
}

}