import { Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportViewerComponent } from '@app/main/dev-express-demo/reportviewer/report-viewer.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AccountsServiceProxy, GetAccountForDropdownDto, GetAllAppItemsInput, GetSycReportForViewDto, SycReportsServiceProxy } from '@shared/service-proxies/service-proxies';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { PrintCatalogueStep } from '../models/print-catalogue-step';
import { PrintCatalogueStepsEnum } from '../models/print-catalogue-steps.enum';
import { ProductCatalogueReportParams } from '../models/product-Catalogue-Report-Params';

@Component({
    selector: 'app-appitemslist-catalogue-report',
    templateUrl: './appitemslist-catalogue-report.component.html',
    styleUrls: ['./appitemslist-catalogue-report.component.scss'],
    animations: [appModuleAnimation()],
})
export class AppitemslistCatalogueReportComponent extends AppComponentBase implements OnInit {
    currentStep: number
    printCatalogueStepsEnum = PrintCatalogueStepsEnum
    steps: PrintCatalogueStep[] = []
    templates: any[]
    // templates : GetSycReportForViewDto []
    @Input() sessionKey: string
    @Input() isModal: boolean
    @Input() getAllAppItemsInput: GetAllAppItemsInput
    printInfoParam: ProductCatalogueReportParams = new ProductCatalogueReportParams()
    reportUrl: string
    accounts: GetAccountForDropdownDto[] = []
    itemListId: number
    @Output() cancel : EventEmitter<any> =  new EventEmitter()
    invokeAction = '/DXXRDV'
    constructor(
        private _injector: Injector,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _accountsServiceProxy: AccountsServiceProxy,
        private _sycReportsServiceProxy: SycReportsServiceProxy,
    ) {
        super(_injector)
    }

    defineSteps() {
        const step1 = new PrintCatalogueStep({ title: this.l("DataSelection"), printCatalogueStepsEnum: PrintCatalogueStepsEnum.DataSelection, icon: "" });
        const step2 = new PrintCatalogueStep({ title: this.l("ChooseTemplate"), printCatalogueStepsEnum: PrintCatalogueStepsEnum.ChooseTemplate, icon: "" });
        const step3 = new PrintCatalogueStep({ title: this.l("CoverPageinfo"), printCatalogueStepsEnum: PrintCatalogueStepsEnum.CoverPage, icon: "" });
        const step4 = new PrintCatalogueStep({ title: this.l("Detailsinfo"), printCatalogueStepsEnum: PrintCatalogueStepsEnum.DetailInfo, icon: "" });
        const step5 = new PrintCatalogueStep({ title: this.l("Deliveryoptions"), printCatalogueStepsEnum: PrintCatalogueStepsEnum.PrintInfo, icon: "" });
        this.steps.push(step1, step2, step3, step4, step5);
    }
    title:string
    active:boolean = false
    ngOnInit(): void {
        this.itemListId = this._activatedRoute.snapshot?.params['listId']
        const sessionKey = this.sessionKey
        
        if(sessionKey) {//products case
            this.printInfoParam.selectedKey = sessionKey
            this.title = 'Products'
        } else if(this.itemListId){//list case - specified
            this.title = 'ProductsList'
            this.printInfoParam.selectedKey = this.guid()
            this.printInfoParam.itemsListId = this.itemListId
        } else {//list case - not specified
        }
        this.defineSteps()
        this.setDefaultParamData()
        // this.showChooseTemplateStep()
        this.changeStep(PrintCatalogueStepsEnum.DataSelection);
        this.active = true
    }
   
    setDefaultParamData() {
        this.printInfoParam.tenantId = this.appSession?.tenantId
        this.printInfoParam.userId = this.appSession?.userId
    }


    redirectToAppItemList() {
        this._router.navigate(['/app/main/productslists'])
    }

    askToConfirmCancel() {
        var isConfirmed: Observable<boolean>;
        let msg = 'AreYouSureYouWantToCancelPrintingThisProductListCatalogue?'
        if(this.isModal) msg = 'AreYouSureYouWantToCancelPrintingTheseProducts?'
        isConfirmed = this.askToConfirm(msg, "");
        isConfirmed.subscribe((res) => {
                if (!res) return
                if(this.isModal) this.cancel.emit()
                else this.redirectToAppItemList()
            }
        )
    }

    searchAccounts(searchTerm: string) {
        this._accountsServiceProxy.getAllAccountsForDropdown(searchTerm)
            .subscribe((res) => {
                this.accounts = res
            })
    }

    changeStep(stepNo: PrintCatalogueStepsEnum) {
        this.currentStep = stepNo
    }

    showChooseTemplateStep() {
        this.getAvailableTemplates()
        this.changeStep(PrintCatalogueStepsEnum.ChooseTemplate)
    }

    getAvailableTemplates() {
        if (this.templates?.length) return
        this._sycReportsServiceProxy.getAll(
            undefined,
            undefined,
            "PRODUCTS-LIST",
            undefined,
            undefined,
            undefined,
        )
            .subscribe((res) => {
                this.templates = res.items
                this.printInfoParam.productsCatalogTemplate = res?.items[0]?.sycReport?.name
            })
    }

    chooseTemplateDone(selectedTemplate: GetSycReportForViewDto) {
        this.printInfoParam.productsCatalogTemplate = selectedTemplate.sycReport.name
        this.changeStep(PrintCatalogueStepsEnum.CoverPage)
    }

    dataSelectionDone() {
        this.showChooseTemplateStep();
    }

    coverPageDone() {
        this.changeStep(PrintCatalogueStepsEnum.DetailInfo);
    }

    DetailInfoDone() {
        this.changeStep(PrintCatalogueStepsEnum.PrintInfo);
    }


    printInfoPrevious() {
        this.changeStep(PrintCatalogueStepsEnum.DetailInfo)
    }

    templatePrevious() {
        this.changeStep(PrintCatalogueStepsEnum.DataSelection)
    }

    coverPagePrevious() {
        this.showChooseTemplateStep();
    }

    DetailInfoPrevious() {
        this.changeStep(PrintCatalogueStepsEnum.CoverPage)
    }
    sendReportEmail : boolean
    printInfoDone() {
        if(this.printInfoParam.EmailLinesheet){
            this.showMainSpinner()
        } 
        this.changeStep(PrintCatalogueStepsEnum.ReportViewer)
        this.reportUrl = this.printInfoParam.getReportUrl()
    }
    reportDocumentReadyHandler($event){
        if(this.printInfoParam.EmailLinesheet){
            this.hideMainSpinner()
            Swal.fire(
                " ",
                this.l("EmailSent"),
                "success"
            ).then(res=>{
                this.goBack('/app/main/Home')
            })
        } 
    }
}
