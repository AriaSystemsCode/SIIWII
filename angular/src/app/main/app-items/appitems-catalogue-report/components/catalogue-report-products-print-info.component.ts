import { Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AccountsServiceProxy, GetAccountForDropdownDto, MessageServiceProxy, NameValueOfString } from '@shared/service-proxies/service-proxies';
import { ProductCatalogueReportParams } from '../models/product-Catalogue-Report-Params';
import { DemoUiEditorComponent } from "@app/admin/demo-ui-components/demo-ui-editor.component";
import { AppConsts } from '@shared/AppConsts';


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
    languageName:string="";
    
    constructor(
        private injector:Injector,  
         private _MessageServiceProxy: MessageServiceProxy, 
         private _AccountsServiceProxy : AccountsServiceProxy
    ) {
        super(injector)
    }

    ngOnInit(): void {
        // this._AccountsServiceProxy.getAccountForView(this.appSession?.user?.accountId,undefined)
        // .subscribe((res) => {
        //     this.userCountry=res.account.countryName;
        // });
  }
    
    previousStep(){
        this.previous.emit(true)
    }

    printAndFinish(printInfoForm:NgForm) {
       // this.printInfoParam.userCountry=this.userCountry ; 
        this.printInfoParam.languageName=  AppConsts.languageSettingName!='en-GB' ? "MSRP"  :  "RRP" ; 
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
addPersonalEmail(
    event: KeyboardEvent,
    type: 'to' | 'cc' | 'bcc',
    autoComplete: any
): void {
    event.preventDefault();
    event.stopPropagation();

    const input = event.target as HTMLInputElement;
    const email = input?.value?.trim().replace(/,$/, '');

    if (!email) {
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        this.notify.warn(this.l('EmailAddressInvalid'));
        return;
    }

    const newEmail = new NameValueOfString();
    newEmail.name = email;
    newEmail.value = email;

    let currentList: NameValueOfString[] = [];

    if (type === 'to') {
        currentList = this.printInfoParam.toUsers || [];

        if (!this.emailAlreadyExists(currentList, email)) {
            this.printInfoParam.toUsers = [...currentList, newEmail];
        }
    }

    if (type === 'cc') {
        currentList = this.printInfoParam.ccUsers || [];

        if (!this.emailAlreadyExists(currentList, email)) {
            this.printInfoParam.ccUsers = [...currentList, newEmail];
        }
    }

    if (type === 'bcc') {
        currentList = this.printInfoParam.bccUsers || [];

        if (!this.emailAlreadyExists(currentList, email)) {
            this.printInfoParam.bccUsers = [...currentList, newEmail];
        }
    }

    input.value = '';

    if (autoComplete?.inputEL?.nativeElement) {
        autoComplete.inputEL.nativeElement.value = '';
    }

    autoComplete.inputValue = '';
    autoComplete.hide?.();
}

handleEmailSeparator(
    event: KeyboardEvent,
    type: 'to' | 'cc' | 'bcc',
    autoComplete: any
): void {
    if (event.key === ',') {
        this.addPersonalEmail(event, type, autoComplete);
    }
}

private emailAlreadyExists(
    list: NameValueOfString[],
    email: string
): boolean {
    return list.some(
        item =>
            item?.value?.trim().toLowerCase() ===
            email.toLowerCase()
    );
}
     
}
