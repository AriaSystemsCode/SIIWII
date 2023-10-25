import { Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GetAccountForDropdownDto, MessageServiceProxy, NameValueOfString } from '@shared/service-proxies/service-proxies';
import { ProductCatalogueReportParams } from '../models/product-Catalogue-Report-Params';
import { DemoUiEditorComponent } from "@app/admin/demo-ui-components/demo-ui-editor.component";


@Component({
    selector: 'app-catalogue-report-products-print-info',
    templateUrl: './catalogue-report-products-print-info.component.html',
    styleUrls: ['./catalogue-report-products-print-info.component.scss']
})
export class CatalogueReportProductsPrintInfoComponent extends AppComponentBase implements OnInit{
    @Output() previous : EventEmitter<boolean> = new EventEmitter<boolean>()
    @Output() continue : EventEmitter<boolean> = new EventEmitter<boolean>()
    @Input() printInfoParam : ProductCatalogueReportParams;
    filteredUsers: NameValueOfString[]=[];

    displayCC: boolean = false;
    displayBCC: boolean = false;
    @ViewChild("demoUiEditor", { static: true })
    demoUiEditor: DemoUiEditorComponent;
    
    constructor(
        private injector:Injector,  
         private _MessageServiceProxy: MessageServiceProxy
    ) {
        super(injector)
    }

    ngOnInit(): void {
  }
    
    previousStep(){
        this.previous.emit(true)
    }

    printAndFinish(printInfoForm:NgForm) {
        this.continue.emit(true)
    }

    onEmailLinesheetChange(value){
        this.printInfoParam.EmailLinesheet=value;
        this.printInfoParam.PrintLinesheet=!value;

    }

    onPrintLinesheetChange(value){
        this.printInfoParam.PrintLinesheet=value;
        this.printInfoParam.EmailLinesheet=!value;
    }
    showCC(): void {
        this.displayCC = true;
    }
    showBCC(): void {
        this.displayBCC = true;
    }
    
    filterUsers(event): void {
        this._MessageServiceProxy
            .getAllUsers(event.query)
            .subscribe((Users) => {
                this.filteredUsers = [];
                for (var i = 0; i < Users.length; i++) {
                    //xxx
                    if (
                        Users[i].users.value.toString() !=
                        this.appSession.userId.toString()
                    ) {
                        Users[i].users.name +=
                        "." +
                        Users[i].surname +
                        " @ " +
                        Users[i].tenantName;

                        this.filteredUsers.push(
                            new NameValueOfString({
                                name:  Users[i].users.name,
                                value:  Users[i].emailAddress
                            }));
                    }
                }
            });
    }
     
}
