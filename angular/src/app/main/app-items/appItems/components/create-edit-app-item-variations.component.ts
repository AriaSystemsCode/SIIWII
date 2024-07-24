import {
    Component,
    EventEmitter,
    Injector,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
    ViewChild,
} from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import {
    AppEntityAttachmentDto,
    GetAllEntityObjectTypeOutput,
    VariationItemDto,
    AppEntityExtraDataDto,
    GetSycAttachmentCategoryForViewDto,
    SycAttachmentCategoryDto,
    LookupLabelDto,
    AppEntitiesServiceProxy,
    CreateOrEditAppItemDto,
    AppItemsServiceProxy,
    AppItemVariationDto,
    AppItemPriceInfo,
    CurrencyInfoDto,
    IAppItemPriceInfo,
    AppSizeScalesDetailDto,
    AppItemSizesScaleInfo,
    IAppItemSizesScaleInfo,
    AppEntityDto,
    VariationListToDeleteDto,
} from "@shared/service-proxies/service-proxies";
import { BsDropdownDirective } from "ngx-bootstrap/dropdown";
import { cloneDeep } from "lodash";
import { ImageCropperComponent } from "@app/shared/common/image-cropper/image-cropper.component";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { AppEntityListDynamicModalComponent } from "@app/app-entity-dynamic-modal/app-entity-list-dynamic-modal/app-entity-list-dynamic-modal.component";
import { Observable, Subscription } from "rxjs";
import { IsVariationExtraAttribute } from "../../app-item-shared/models/IsVariationExtraAttribute";
import { IVaritaionAttachment } from "../../app-item-shared/models/IVaritaionAttachment";
import { ExtraAttributeDataService } from "../../app-item-shared/services/extra-attribute-data.service";
import { ListingModeEnum } from "../models/app-item-listing-enum";
import { PricingHelpersService } from "../../app-item-shared/services/pricing-helpers.service";
import { AccordionTab } from "primeng/accordion";
import { SelectItem } from "primeng/api";
import { SelectAppItemTypeComponent } from "@app/app-item-type/select-app-item-type/select-app-item-type.component";
import { table } from "console";
import { CreateOrEditAppEntityDynamicModalComponent } from "@app/app-entity-dynamic-modal/create-or-edit-app-entity-dynamic-modal/create-or-edit-app-entity-dynamic-modal.component";
import Swal from "sweetalert2";

@Component({
    selector: "app-create-edit-app-item-variations",
    templateUrl: "./create-edit-app-item-variations.component.html",
    styleUrls: ["./create-edit-app-item-variations.component.scss"],
    animations: [appModuleAnimation()],
})
export class CreateEditAppItemVariationsComponent
    extends AppComponentBase
    implements OnChanges
{
    @Input("isListing") isListing: boolean = false;
    @Input("listingMode") listingMode: ListingModeEnum;
    @Input() currencies: CurrencyInfoDto[];
    @Input() updateVariation: boolean = true;
    @Input() productTypeId: number;
    @Input() productCode: any;
    @Input() extraVariationsTypes:any
    @ViewChild("variationCombinationTap") variationCombinationTap: AccordionTab;
    @ViewChild("createOreEditAppEntityModal") createOreEditAppEntityModal: CreateOrEditAppEntityDynamicModalComponent;
    
    extraVariations: any[];
    siwiMarketPlaceColor: any[];
    sizes: any[];
    siwiSizes: any[];
    removeSizeExtraAttr:boolean=false;
    editVariationsOpend:boolean=false;
    // @ViewChild('appSelectionModal', { static: true }) appSelectionModal: SelectionModalComponent<LookupLabelDto>
    // @ViewChild('appFormModal', { static: true }) appFormModal: GenericFormModalComponent

    selectedVaritaions: VariationItemDto[] = [];
    stokeAvailability: number;
    get selectedExtraAttributesNames(): string[] {
        return this.selectedExtraAttributes.reduce((accum: string[], elem) => {
            accum.push(elem.name);
            return accum;
        }, []);
    }

    private _showVariations: boolean = false;
    public get showVariations(): boolean {
        return this._showVariations;
    }
    public set showVariations(value: boolean) {
        if (this.isListing) this.selectedVaritaions = this.variationMatrices;
  this._showVariations = value;
  
//   this.selectedVaritaions =this.variationMatrices.filter((variation) => {
//             return !variation.ssin;
//         });
      
    }

    showVariationValues = false;
    showVariationSelectionMetaData = false;
    showVariationPhotos: boolean = false;
    editVariation: boolean = true;

    extraAttributes: IsVariationExtraAttribute[];
    extraAttributesOptions: { [key: string]: SelectItem[] };
    activeExtraAttributeIndex: number = -1;

    oldExtraAttributesData: IsVariationExtraAttribute[] = [];

    selectedExtraAttr: { [key: string]: number[] } = {};
    defaultExtraAttrForAttachments: IsVariationExtraAttribute;
    activeAttachmentOption: IVaritaionAttachment = undefined;

    variationAttachmentsSrcs: string[] = [];
    oldDefaultExtraAttrForAttachments = undefined;
    oldActiveAttachmentOption = undefined;

    variationMatrices: VariationItemDto[] = [];
    attributeID: any;
    sizeId: any;
    selectedAttrID:string
    firstAttachSelection;

    @Input("selectedItemTypeData")
    selectedItemTypeData: GetAllEntityObjectTypeOutput;
    @Input("appItem") appItem: CreateOrEditAppItemDto;
    @Input("defaultAppItemImage") defaultAppItemImage: string;
    @Output("applyVariations")
    applyVariations: EventEmitter<ApplyVariationOutput> =
        new EventEmitter<ApplyVariationOutput>();
    @Output("cancel") cancel: EventEmitter<boolean> =
        new EventEmitter<boolean>();

    appItemDefaultImage: string;
    hideUnselectedVariations: boolean = false;
    entityObjectType: string = "PRODUCTVARIATION";
    stylesObj = {
        width: "195px",
        height: "60px",
    };
    sizeExtraAttrCode: string = "SIZE".toUpperCase();
    pricingFilter: {
        currencyId: number;
        level: string;
        variationCorrespondingIndex: number[];
    };
    appSizeRatios: AppItemSizesScaleInfo = new AppItemSizesScaleInfo({
        appSizeScalesDetails: [],
    } as IAppItemSizesScaleInfo);
    showViewSelectedSizes: boolean = false;
    appSizeScales: AppItemSizesScaleInfo = new AppItemSizesScaleInfo({
        appSizeScalesDetails: [],
    } as IAppItemSizesScaleInfo);
    parentProductUnselectedVariations: VariationItemDto[];
    levels: SelectItem[];

    get selectedExtraAttributes() {
        return this.extraAttributes.filter((attr) => attr.selected);
    }

    getallAtrributes() {
        this._appItemsServiceProxy
            .getProductVariationsTypes(this.productTypeId)
            .subscribe((res: any) => {
                this.extraVariations = res;
            });
    }

    handleAttrChange(event: any) {
        let value;
        if(event?.target?.value)
        value=event?.target?.value;
    else
    value=event;
            
        let varaitionsValue = this.extraVariations.map((variation: any) => {
            if (Number(value) === variation.id) {
                return variation.variationAttributes;
            }
        });
        this.appItem.sycIdentifierId = Number(value);
        this.attributeID = value;
    
    
        varaitionsValue[0].map((variation: any) => {
            this.extraAttributes.map((attr: IsVariationExtraAttribute) => {
                if (attr.attributeId === variation.attributeId) {
                    attr.selected = true;
                }
            });
        });
        (document.getElementsByClassName('sizeAttrsDDl')[0] as HTMLSelectElement).selectedIndex=0;

    }
    get variationPossibilities() {
        var count = 0;
        this.selectedExtraAttributes?.forEach((extraAttr) => {
            let extraAttrSelectedValues: number;
            // if (
            //     this.sizeExtraAttrCode ==
            //     extraAttr.entityObjectTypeCode?.toUpperCase()
            // ) {
            //     extraAttrSelectedValues =
            //         this.appSizeRatios?.appSizeScalesDetails?.length;
            // } else {
                extraAttrSelectedValues = extraAttr.selectedValues?.length;
            // }
            if (count == 0 && extraAttrSelectedValues > 0) count = 1;
            if (extraAttrSelectedValues) count *= extraAttrSelectedValues;
        });
        return count;
    }
    get selectedCurrency() {
        return this.currencies.filter(
            (curr) => curr.value == this.pricingFilter.currencyId
        )[0];
    }

    showExisttingVariation=false;
    activeExisttingVariation=false;
    showNewVariation=false;
    activeNewVariation=false;

    constructor(
        injector: Injector,
        private _extraAttributeDataService: ExtraAttributeDataService,
        private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
        private _appItemsServiceProxy: AppItemsServiceProxy,
        private _BsModalService: BsModalService,
        private _pricingHelpersService: PricingHelpersService
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.initUploaders();
        this.initPricingNeededData();
        this.getSiwiiMarketPlaceColor();
        this._appEntitiesServiceProxy
            .getMarketPlaceSizes()
            .subscribe((res: any) => {
                this.sizes = res;
            });

          this.selectedAttrID = this.appItem?.sycIdentifierId?.toString()
          this.selectedAttrID?null:this.editVariationsOpend=true;

    }

    async getSiwiiMarketPlaceColor() {
        const response =
            await this._extraAttributeDataService.getExtraAttributesLookupDataAsync(
                ["COLOR-SCHEME"]
            );
        this.siwiMarketPlaceColor = response;
        console.log(">>", response);
    }
    selectedValue: any = "";
    test: boolean = true;

    initPricingNeededData() {
        this.levels = [
            {
                label: this._pricingHelpersService.defaultLevel,
                value: this._pricingHelpersService.defaultLevel,
            },
            ...this._pricingHelpersService.levels.map((item) => {
                return {
                    label: item,
                    value: item,
                };
            }),
        ];
        this.pricingFilter = {
            currencyId: this.tenantDefaultCurrency.value,
            level: this._pricingHelpersService.defaultLevel,
            variationCorrespondingIndex: [],
        };
    }
    ngOnChanges(changes: SimpleChanges) {
        if(!this.extraVariationsTypes){
           this.getallAtrributes();

        }else{
          if(!this.extraVariations){
            this.extraVariations=this.extraVariationsTypes;
          }
        }

        if (this.appItem && this.selectedItemTypeData) {
            // get sizescale and size ratios data if exists
            if (
                this.appItem?.appItemSizesScaleInfo?.length > 0 &&
                this.appItem?.appItemSizesScaleInfo[0]
            )
                this.appSizeScales = new AppItemSizesScaleInfo(
                    this.appItem?.appItemSizesScaleInfo[0]
                );
            if (
                this.appItem?.appItemSizesScaleInfo?.length > 0 &&
                this.appItem?.appItemSizesScaleInfo[1]
            )
                this.appSizeRatios = new AppItemSizesScaleInfo(
                    this.appItem?.appItemSizesScaleInfo[1]
                );
            // get lookup data attributes
            this.getNeededDataForEditMode();

            //deep clone extra attributes
            this.selectedItemTypeData = GetAllEntityObjectTypeOutput.fromJS(
                this.selectedItemTypeData
            );


            }

         this.setExistingAndNewVariations();
         this.setSelectionVariations();
    }
    
    setExistingAndNewVariations (){
        if(this.appItem?.id){
            this.showExisttingVariation=true;
                       this.activeExisttingVariation=true;
           
                    let variationsWithoutSSIN=   this.variationMatrices.filter((variation) => {
                           return !variation.ssin;
                       });
                   
                       if(!variationsWithoutSSIN || variationsWithoutSSIN?.length==0){
                       this.activeNewVariation=false;
                       this.showNewVariation=false;
                       }
                       else
                           this.showNewVariation=true;
                  
                         
                  this.getExistingVariations()
                        }
                   else{
                       this.showExisttingVariation=false;
                       this.activeExisttingVariation=false;
                      this.activeNewVariation=true;
                      this.showNewVariation=true;
                   }
    }

   
    detectAppItemDefaultImage() {
        this.appItemDefaultImage = this.appItem.entityAttachments.filter(
            (item) => item.isDefault
        )[0].url;
    }

    async getNeededDataForEditMode() {
        // get extraatributes data by product type id
        await this.getItemTypeDataAndExtraAttributes();
        this.deepCloneVariations();

        this.setExistingAndNewVariations();
        this.setSelectionVariations();

        // get item type extra data and group them and their options
        if (this.variationMatrices && this.variationMatrices.length) {
            this.variationMatrices.map((item, index) => {
                item.position = index + 1;
                return item;
            });
            this.reverseEngineerVariations();
            if (this.listingMode === ListingModeEnum.Edit)
                this.getUnselectedProductVariations(this.appItem.listingItemId);
            this.initializePricesObjects();
            this.checkAndAddDefaultPriceObjects();
            this.editExtraAtrributeSelection();
        }
        // images
        // define the default attribute for images
        // get the images from inside the variations
        // adjust image urls
        // reverse engineer the selected extra attributes and all selected unique values
        // this.extraAttributesOptions = ExtraAttributesOptionsData

        if(this.extraVariations?.length>0)
        this.handleAttrChange(this.extraVariations[0]?.id)
    }

    deepCloneVariations() {
        //deep clone variations
        let appItemVariations = this.appItem.variationItems;
        if (Array.isArray(appItemVariations) && appItemVariations.length) {
            this.variationMatrices = [];
            appItemVariations.forEach((elem) =>
                this.variationMatrices.push(VariationItemDto.fromJS(elem))
            );
            console.log(">>", this.variationMatrices);
            this._appEntitiesServiceProxy
                .getMarketPlaceSizes()
                .subscribe((res: any) => {
                    this.sizes = res;
                });
                
            this.primengTableHelper.records = this.variationMatrices;
            this.showVariationSelectionMetaData = true;
            this.showVariationValues = false;
            this.showVariations = true;
        }
    }

    // resetExtraAttributeSelection(){
    //     this.extraAttributes.map(elem=>{
    //         elem.selected = false ;
    //         elem.selectedValues = []
    //         elem.selectedValuesAttachments = undefined
    //     })
    //     this.activeExtraAttributeIndex = -1
    //     this.showVariationSelectionMetaData = false
    //     this.showVariations = false
    //     this.showVariationPhotos = false
    //     this.oldDefaultExtraAttrForAttachments = this.defaultExtraAttrForAttachments
    //     this.defaultExtraAttrForAttachments = undefined
    //     this.oldActiveAttachmentOption = this.activeAttachmentOption
    //     this.activeAttachmentOption = undefined
    // }

    // editCurrentVariations() {
    //     this.showVariationSelectionMetaData = false
    //     return;
    //     var isConfirmed: Observable<boolean>;
    //     isConfirmed = this.askToConfirm('AllVariationCombinationsWillBeLost,AreYouSure?', "Warning");

    //     isConfirmed.subscribe((res) => {
    //         if (res) {
    //             // save old values
    //             this.oldExtraAttributesData = []
    //             this.extraAttributes.forEach((elem) => {
    //                 this.oldExtraAttributesData.push(
    //                     cloneDeep(elem)
    //                 )
    //             })
    //             // reset current values
    //             this.resetExtraAttributeSelection()
    //             this.showVariationSelectionMetaData = false
    //             this.showVariationPhotos = false
    //         }
    //     }
    //     )
    // }

    cancelExtraAttributeSelection() {
        if (this.variationMatrices.length === 0) {
            this.extraAttributes.map((item) => {
                item.selected = false;
                item.selectedValues = [];
                item.displayedSelectedValues=[];
            });
            this.activeExtraAttributeIndex = -1;
            return;
        }
        this.extraAttributes = [];
        this.oldExtraAttributesData.forEach((elem) => {
            this.extraAttributes.push(cloneDeep(elem));
        });
        this.oldExtraAttributesData = [];
        this.defaultExtraAttrForAttachments =
            this.oldDefaultExtraAttrForAttachments;
        this.oldDefaultExtraAttrForAttachments = undefined;
        this.activeAttachmentOption = this.oldActiveAttachmentOption;
        this.oldActiveAttachmentOption = undefined;

        this.showVariationSelectionMetaData = true;
        this.showVariationPhotos = true;
        this.showVariations = true;
        this.editVariationsOpend=false;

    }
    async getItemTypeDataAndExtraAttributes() {
        return new Promise(async (resolve, reject) => {
            this.extraAttributes =
                this._extraAttributeDataService.getIsVariationFilteredAttributes(
                    this.selectedItemTypeData.extraAttributes.extraAttributes,
                    false
                );
            let extraAttributesCodes: string[] = this.extraAttributes.map(
                (item) => item.entityObjectTypeCode
            );
            // let responses = this._extraAttributeDataService.getExtraAttributesLookupDataAsync(extraAttributesCodes)
            let requests: Promise<LookupLabelDto[]>[] = [];
            extraAttributesCodes.forEach((code) => {
                let req = this._appEntitiesServiceProxy
                    .getAllEntitiesByTypeCode(code)
                    .toPromise();
                requests.push(req);
            });
            let responses = await Promise.all(requests);
            console.log(">> size", responses);
            this.siwiSizes = responses[1];
            if (responses) {
                this.extraAttributes.forEach((extraAttr, index) => {
                    let lookupData = responses[index];
                    extraAttr.lookupData = lookupData;
                    extraAttr.displayedLookupData = extraAttr.lookupData;
                    extraAttr.displayedSelectedValues =  extraAttr.lookupData.filter(item => extraAttr.selectedValues.includes(item.value))
                });
                this.tempAddNewAttributes()
                resolve(true);
            } else {
                reject(false);
                this.notify.error(this.l("FailedToGetAttibutesValues"));
            }
        });
    }
    getUniqueId = function(uniqueTempIds : Set<number>) : number { 
        var r = Math.floor(Math.random() * 1e10) + 1e11;
        if(uniqueTempIds.has(r)) this.getUniqueId()
        else {
            uniqueTempIds.add(r);
            return r
        }
    }
    tempAddNewAttributes(){
        var uniqueTempIds = new Set<number>();
        const currentComponent=this;
        this.appItem?.variationItems?this.editVariationsOpend=false:this.editVariationsOpend=true;
        this.appItem?.variationItems?.forEach(variation=>{
            variation.entityExtraData.forEach(entityExtraData=>{
                const extraAttr = this.extraAttributes?.filter(extraAtt=>extraAtt?.entityObjectTypeCode == entityExtraData?.entityObjectTypeCode)[0]
                const isExist = extraAttr?.lookupData.filter(item=>item.code == entityExtraData?.attributeCode)[0] 
                if(!isExist) {
                    const tempAtt = new LookupLabelDto({
                        code:entityExtraData?.attributeCode,
                        value:currentComponent.getUniqueId(uniqueTempIds),
                        label:entityExtraData?.attributeValue,
                        stockAvailability:0,
                        isHostRecord:false,
                        hexaCode:undefined,
                        image:undefined
                    })
                    extraAttr?.lookupData?.push(tempAtt)
                }
            })
        })
    }
    removeExtraAttribute(extraAttr: IsVariationExtraAttribute, index: number) {
        
        // this.selectedExtaAttrCtrl.removeControl(name)
        if (extraAttr.entityObjectTypeCode == this.sizeExtraAttrCode) {
            this.appSizeRatios = new AppItemSizesScaleInfo({
                appSizeScalesDetails: [],
            } as IAppItemSizesScaleInfo);
            this.appSizeScales = new AppItemSizesScaleInfo({
                appSizeScalesDetails: [],
            } as IAppItemSizesScaleInfo);
            this.removeSizeExtraAttr=true;
        }
        extraAttr.selected = false;
        extraAttr.selectedValues = [];
        extraAttr.displayedSelectedValues=[];
        if (this.selectedExtraAttributes.length === 0)
            this.activeExtraAttributeIndex = -1;
        if (this.activeExtraAttributeIndex == index && index > 0)
            this.activeExtraAttributeIndex = index - 1;
    }

    setActiveExtraAttribute(index: number) {
        this.activeExtraAttributeIndex = -1;
        setTimeout(() => {
            this.activeExtraAttributeIndex = index;
        }, 1);
    }

    saveExtraAtrributeSelection() {

        const oldVariations = this.variationMatrices;
        this.editVariationsOpend=false;
        if(!this.appItem?.id)
         this.variationMatrices = [];
        if (this.selectedExtraAttributes.length === 0)
            return this.notify.error(this.l("PleaseSelectVariationsFirst"));
        const sizeIsSelected = this.selectedExtraAttributes.filter(
            (item) => item.entityObjectTypeCode == this.sizeExtraAttrCode
        )[0];
        if (
            sizeIsSelected &&
            ((!this.sizeScaleFormIsValid && !this.appSizeScales )|| (!this.sizeRatioFormIsValid && !this.appSizeScales) )
        )
            return this.notify.error(
                this.l("PleaseCompleteAllSizeScaleAndSizeRatioRequired(*)Data")
            );
        if (!sizeIsSelected) {
            this.appSizeRatios = new AppItemSizesScaleInfo({
                appSizeScalesDetails: [],
            } as IAppItemSizesScaleInfo);
            this.appSizeScales = new AppItemSizesScaleInfo({
                appSizeScalesDetails: [],
            } as IAppItemSizesScaleInfo);
        }

        this.createAllPossibleVariationsCombination(oldVariations);
        this.initializePricesObjects();
        this.checkAndAddDefaultPriceObjects();
        this.checkIfVariationsAlreadyExists(oldVariations);
        this.mapExtraAttrSelectionDataFromVariationMatrices();
        // this.primengTableHelper.records = this.variationMatrices;

        console.log(">> list variation", this.variationMatrices);
        const variationMatricesWithoutValuesIds = this.variationMatrices.map(item=>{
            
            let curentItem=this.primengTableHelper?.records?.filter((record)=>record.code==item.code)[0];
            const var_ = new VariationItemDto();
            var_.init(item)
            var_.entityExtraData.forEach(item=>item.attributeValueId = undefined)
            if(curentItem?.stockAvailability>0){
                var_.stockAvailability=curentItem.stockAvailability;
            }
            if(curentItem?.ssin>0){
                var_.ssin=curentItem.ssin;
            } 
            return var_
        })
        this.showMainSpinner();

        this._appItemsServiceProxy
            .getVariationsCodes(
                this.attributeID  ?     this.attributeID  : this.appItem?.sycIdentifierId,
                this.productCode,
                this.productTypeId,
                this.appSession.tenantId,
                variationMatricesWithoutValuesIds
            )
            .subscribe((response: any) => {
                console.log(">>", response, this.variationMatrices);
                
                /*response.forEach((record)=>{
                    let curentItem=this.primengTableHelper.records.filter((item)=>item.code==record.code);
                    if(curentItem[0]['stockAvailability']>0){
                        record.stockAvailability=curentItem['stockAvailability'];
                    }
                })*/
                
                this.primengTableHelper.records = response;
            //    this.selectedVaritaions = [...this.primengTableHelper.records];
                this.variationMatrices = response;

                if(this.appItem?.id)
                this.getExistingVariations()

                this.setSelectionVariations();
                this.hideMainSpinner();

            });
        this.showVariationSelectionMetaData = true;
        this.showVariationPhotos = true;
        this.showVariations = true;
    }
    checkIfVariationsAlreadyExists(oldVariations: VariationItemDto[]) {
        if (!oldVariations.length)
            return this.setDefaultExtraAttributeForVariationAttachment(
                this.selectedExtraAttributes[0]
            );
        const oldVariationsExtraAttrs = oldVariations[0]?.entityExtraData.map(
            (item) => item.attributeId
        );
        const newVariationsExtraAttrs =
            this.variationMatrices[0]?.entityExtraData.map(
                (item) => item.attributeId
            );
        const compareVariationRow = (
            variationRow: VariationItemDto,
            variationsRows: VariationItemDto[]
        ): VariationItemDto => {
            const selectedExtraAttrValuesIds = variationRow.entityExtraData.map(
                (item) => item.attributeCode
            );
            const oldExtraAttrCount: number =
                variationsRows[0]?.entityExtraData?.length || -1;
            const newExtraAttrCount: number =
                selectedExtraAttrValuesIds.length || -1;
            if (newExtraAttrCount != oldExtraAttrCount) return undefined;
            const existIndex = variationsRows.findIndex((row) =>
                row.entityExtraData.every((item) =>
                    selectedExtraAttrValuesIds.includes(item.attributeCode)
                )
            );
            return variationsRows[existIndex];
        };
        // check if the extra attributes are the same
        if (
            oldVariationsExtraAttrs.length == newVariationsExtraAttrs?.length ||
            oldVariationsExtraAttrs.every((item) =>
                newVariationsExtraAttrs?.includes(item)
            )
        ) {
            this.variationMatrices = this.variationMatrices.map((varRow) => {
                const existsRow = compareVariationRow(varRow, oldVariations);
                if (existsRow) varRow = existsRow;
                const currentRowDefaultAttachmentEntityExtraData =
                    varRow.entityExtraData.filter(
                        (extrData) =>
                            extrData.attributeId ==
                            this.defaultExtraAttrForAttachments.attributeId
                    )[0];
                if (currentRowDefaultAttachmentEntityExtraData) {
                    varRow.entityAttachments =
                        this.defaultExtraAttrForAttachments
                            .selectedValuesAttachments[
                            currentRowDefaultAttachmentEntityExtraData
                                .attributeCode
                        ]?.entityAttachments || [];
                }
                return varRow;
            });
        }
        if (
            newVariationsExtraAttrs?.includes(
                this.defaultExtraAttrForAttachments.attributeId
            )
        ) {
            const oldAttachmentObject =
                this.defaultExtraAttrForAttachments.selectedValuesAttachments;
            this.defaultExtraAttrForAttachments.selectedValuesAttachments = {};
            let attachmentObj: { [key: number]: IVaritaionAttachment } =
                this.defaultExtraAttrForAttachments.selectedValuesAttachments;
            (
                this.defaultExtraAttrForAttachments.selectedValues as number[]
            ).forEach((elem) => {
                // this.defaultExtraAttrForAttachments = selectedExtraAttr[currentExtraDataIndex]
                if (oldAttachmentObject[elem]) {
                    attachmentObj[elem] = oldAttachmentObject[elem];
                } else {
                    let selectedValue: SelectItem =
                        this.defaultExtraAttrForAttachments.lookupData.filter(
                            (item) => item.value == elem
                        )[0];
                    attachmentObj[elem] = {
                        attachmentSrcs: [""],
                        entityAttachments: [],
                        defaultImageIndex: -1,
                        lookupData: selectedValue,
                    };
                }
            });
            this.updateVaritaionAttachments();
        }
    }

    setDefaultExtraAttributeForVariationAttachment(
        extraAttr: IsVariationExtraAttribute,
        generatePhotos: boolean = true
    ) {
        
        const sameSelection: boolean =
            this.defaultExtraAttrForAttachments == extraAttr;

        if (sameSelection) return;
        else this.defaultExtraAttrForAttachments = extraAttr;
        // reset selected values if one exists
        this.selectedExtraAttributes.map((elem, index) => {
            elem.defaultForAttachment = extraAttr == elem;
            if (extraAttr != elem) elem.selectedValuesAttachments = undefined;
            else elem.selectedValuesAttachments = {};
            return elem;
        });

        if (generatePhotos)
            this.generatePhotosObjectForDefaultExtraAttributeOfVariationAttachment();
        this.updateVaritaionAttachments();
    }

    getParentProductPrices() {
        return this.appItem.appItemPriceInfos.map((item) =>
            AppItemPriceInfo.fromJS({ ...item, id: 0 } as IAppItemPriceInfo)
        );
    }
    initializePricesObjects() {
        this.variationMatrices?.forEach((variation) => {
            //  if(!variation.appItemPriceInfos || variation.appItemPriceInfos.length == 0)
            if (this.updateVariation) {
               if(!variation.appItemPriceInfos ) variation.appItemPriceInfos = this.getParentProductPrices();
            }
        });
    }
    checkAndAddDefaultPriceObjects() {
        if (!this.pricingFilter.level)
            this.pricingFilter.level = this._pricingHelpersService.defaultLevel;
        if (!this.pricingFilter.currencyId)
            this.pricingFilter.currencyId = this.tenantDefaultCurrency.value;
        const level = this.pricingFilter.level;
        this.pricingFilter.variationCorrespondingIndex = [];
        const currencyId = this.pricingFilter.currencyId;

        this.variationMatrices.forEach((item) => {
            let index = this._pricingHelpersService.getPricingIndex(
                item.appItemPriceInfos,
                level,
                currencyId
            );
            if (index == -1) {
                const newPriceDto =
                    this._pricingHelpersService.getPricingInstance(
                        level,
                        this.selectedCurrency
                    );
                item.appItemPriceInfos.push(newPriceDto);
                index = item.appItemPriceInfos.length - 1;
            }
            this.pricingFilter.variationCorrespondingIndex.push(index);
        });
    }

    filterPricing() {
        this.checkAndAddDefaultPriceObjects();
    }
    generatePhotosObjectForDefaultExtraAttributeOfVariationAttachment() {
        let defaultImageExtraAttr = this.defaultExtraAttrForAttachments;

        const valuesAttachmentObject =
            defaultImageExtraAttr.selectedValuesAttachments;

        const selectedValues: any[] = defaultImageExtraAttr.selectedValues;

        // build attachment data for each value of the default selected attibute
       
        defaultImageExtraAttr.lookupData.forEach((elem: SelectItem) => {
            // if(defaultImageExtraAttr.entityObjectTypeCode == this.sizeExtraAttrCode){
            //     let optionCode : string = (elem as any).code;
            //     let isSelected = selectedValues.includes(optionCode);
            //     if (isSelected) {
            //         valuesAttachmentObject[optionCode] = {
            //             entityAttachments: [],
            //             attachmentSrcs: [""],
            //             lookupData: elem,
            //             defaultImageIndex: -1,
            //         };
            //     }
            // } else {
                let optionId = elem.value;
                let isSelected = selectedValues.includes(optionId);
                if (isSelected) {
                    valuesAttachmentObject[optionId] = {
                        entityAttachments: [],
                        attachmentSrcs: [""],
                        lookupData: elem,
                        defaultImageIndex: -1,
                    };
                }
            // }
        });

        // set first option value as active
        if (defaultImageExtraAttr.selectedValues.length) {
            let key = defaultImageExtraAttr.selectedValues[0];
            this.activeAttachmentOption =
                defaultImageExtraAttr.selectedValuesAttachments[key];
        }
    }
    setDefaultImage(index) {
        if (
            this.activeAttachmentOption.entityAttachments == null ||
            this.activeAttachmentOption.entityAttachments == undefined
        ) {
            this.activeAttachmentOption.entityAttachments = [];
        }
        this.activeAttachmentOption.defaultImageIndex = index;
        this.activeAttachmentOption.entityAttachments.map((item, i) => {
            item.isDefault = index == i ? true : false;
            return item;
        });
        this.updateVaritaionAttachments();
    }

    removePhoto(i: number) {
        if (
            this.activeAttachmentOption.defaultImageIndex === i &&
            this.activeAttachmentOption.entityAttachments.length > 1
        )
            return this.notify.info(
                "Please set another image as default first"
            );
            var index= this.activeAttachmentOption.entityAttachments.findIndex(x=>x.fileName == (this.activeAttachmentOption.attachmentSrcs[i].split('/').pop() || ''));

            this.activeAttachmentOption.attachmentSrcs.splice(i, 1);
                if(index>=0)
                this.activeAttachmentOption.entityAttachments.splice(index, 1);
        
                let imagesCount = this.activeAttachmentOption.entityAttachments.length;
        if (
            (imagesCount === 9 &&
                this.activeAttachmentOption.attachmentSrcs.every(
                    (item) => item
                )) ||
            imagesCount === 0
        )
            this.activeAttachmentOption.attachmentSrcs.push("");
        else if (this.activeAttachmentOption.defaultImageIndex > i)
            this.activeAttachmentOption.defaultImageIndex--;
        this.updateVaritaionAttachments();
    }

    removeAllAttachments() {
        var isConfirmed: Observable<boolean>;
        isConfirmed = this.askToConfirm(
            "AreYouSureYouWanToDeleteAllTheAttachments",
            "Warning"
        );

        isConfirmed.subscribe((res) => {
            if (res) {
                let attachmentValues =
                    this.defaultExtraAttrForAttachments
                        .selectedValuesAttachments;
                Object.keys(attachmentValues).forEach((key) => {
                    attachmentValues[Number(key)].entityAttachments = [];
                    attachmentValues[Number(key)].attachmentSrcs = [""];
                    attachmentValues[Number(key)].defaultImageIndex = -1;
                });
                this.updateVaritaionAttachments();
            }
        });
    }

    fileChange(event, index: number) {
        if (event.target.value) {
            // there is a file
            // destructing operator => declare 2 variables from the returned object with the same keys names
            let { onCropDone, data } = this.openImageCropper(
                event,
                undefined,
                true
            );
            let subs = onCropDone.subscribe((res) => {
                if (data.isCropDone) {
                    this.tempUploadImage(event, data, index);
                }
                // reset input
                event.target.value = null;
                subs.unsubscribe();
            });
        }
    }

    attachmentCategory: GetSycAttachmentCategoryForViewDto =
        new GetSycAttachmentCategoryForViewDto({
            imgURL: null,
            sycAttachmentCategory: new SycAttachmentCategoryDto({
                code: "IMAGE",
                name: "Image",
                attributes: null,
                parentCode: null,
                parentId: null,
                id: 1,
            } as any),
            sycAttachmentCategoryName: "",
        });

    tempUploadImage(
        event: Event,
        croppedImageContent: ImageCropperComponent,
        index: number
    ) {
        const file = (event.target as HTMLInputElement).files[0];
        // this.attachmentCategory.imgURL = croppedImageContent.croppedImageAsBase64 as string

        if (
            this.activeAttachmentOption.entityAttachments == null ||
            this.activeAttachmentOption.entityAttachments == undefined
        ) {
            this.activeAttachmentOption.entityAttachments = [];
        }
        // create GuId
        let guid = this.guid();
        // create app attachment entity
        let att: AppEntityAttachmentDto = new AppEntityAttachmentDto();
        att.index = index;
        att.fileName = file.name;
        let extraAttrId = this.defaultExtraAttrForAttachments.attributeId;
       // let optionValue = this.activeAttachmentOption.lookupData.value;
       let optionValue;
       if('code' in  this.activeAttachmentOption?.lookupData)
        optionValue=this.activeAttachmentOption?.lookupData?.code;
    else
    optionValue=this.activeAttachmentOption.lookupData.value;

        att.attributes = `${extraAttrId}=${optionValue}`;
        att.attachmentCategoryId =
            this.attachmentCategory.sycAttachmentCategory.id;
        att.guid = guid;
        att.url = croppedImageContent.croppedImageAsBase64 as string;

        // save image as a base64
        this.activeAttachmentOption.attachmentSrcs[index] =
            croppedImageContent.croppedImageAsBase64 as string;
        this.activeAttachmentOption.entityAttachments[index] = att;
        if (this.activeAttachmentOption.entityAttachments.length == 1) {
            this.setDefaultImage(0);
        }

        if (
            this.activeAttachmentOption.attachmentSrcs.every((elem) => elem) &&
            this.activeAttachmentOption.attachmentSrcs.length < 10
        )
            this.activeAttachmentOption.attachmentSrcs.push("");
        this.updateVaritaionAttachments();

        this.uploadBlobAttachment(croppedImageContent.croppedImage, att);
    }

    triggerActiveOptionAttachments(optionObject: IVaritaionAttachment) {
        this.activeAttachmentOption = optionObject;
    }

    createAllPossibleVariationsCombination(oldVariations) {
        // needs validation on the data before generate combintaion
 
        this.combine(0, new VariationItemDto(),oldVariations);

        // this.setDefaultExtraAttributeForVariationAttachment(this.selectedExtraAttributes[0])
    }

    /*combine(index: number, _variation: VariationItemDto) {
        
        let currentExtraAttr = this.selectedExtraAttributes[index];
        let totalSelectedExtraAttributes = this.selectedExtraAttributes.length;
        const createNewVariation = (
            attrLabel: string,
            attrCode: string,
            attrId?: number
        ) => {
            let ___varitation = VariationItemDto.fromJS(_variation);

            if (!___varitation.entityExtraData)
                ___varitation.entityExtraData = [];
            if (!___varitation.appItemPriceInfos)
                ___varitation.appItemPriceInfos = this.getParentProductPrices();
            if (
                ___varitation.entityExtraData.length ==
                totalSelectedExtraAttributes
            ) {
                ___varitation = new VariationItemDto();
                ___varitation.entityExtraData = [];
            }

            let entityExtraData = new AppEntityExtraDataDto({
                attributeId: currentExtraAttr.attributeId,
                attributeValue: attrLabel,
                attributeValueId: attrId,
                id: 0,
                entityId: 0,
                entityObjectTypeCode: currentExtraAttr.entityObjectTypeCode?currentExtraAttr.entityObjectTypeCode:currentExtraAttr.name.toLocaleLowerCase().includes('color')?'COLOR':'SIZE',
                attributeValueFkName: undefined,
                entityObjectTypeName: undefined,
                entityObjectTypeId: undefined,
                attributeValueFkCode: attrCode,
                attributeCode: attrCode,
            });
            ___varitation.entityExtraData.push(entityExtraData);
            if (index < totalSelectedExtraAttributes - 1) {
                this.combine(index + 1, ___varitation); //complete comibinig
            } else {
                //comibining done, now lets create a new variation row
                ___varitation.price = this.appItem.price;
                ___varitation.stockAvailability = 0;
                ___varitation.id = 0;
                ___varitation.entityAttachments = [];
                ___varitation.position = this.variationMatrices.length;

                for (
                    var i = 0;
                    i < ___varitation?.entityExtraData?.length;
                    i++
                ) {
                    if (i == 0) {
                        if (this.appItem.code)
                            ___varitation.code = this.appItem?.code;
                        else ___varitation.code = "";
                    }

                    ___varitation.code +=
                        "-" +
                        (___varitation?.entityExtraData[i]?.attributeCode ||
                            ___varitation?.entityExtraData[i]
                                ?.attributeValueFkCode);
                }
                let newVariation: VariationItemDto =
                    VariationItemDto.fromJS(___varitation);
                this.variationMatrices.push(newVariation);
            }
        };
        //currentExtraAttr.entityObjectTypeCode?currentExtraAttr.entityObjectTypeCode=currentExtraAttr.entityObjectTypeCode:currentExtraAttr.name.toLocaleLowerCase().includes('color')?currentExtraAttr.entityObjectTypeCode='COLOR':currentExtraAttr.entityObjectTypeCode='SIZE',
//if(currentExtraAttr?.entityObjectTypeCode){
               if (currentExtraAttr?.entityObjectTypeCode !== this.sizeExtraAttrCode) {
                currentExtraAttr.selectedValues.forEach((attrId) => {
                    if(attrId || attrId>=0){
                    let attrOptionData: any = currentExtraAttr.lookupData.filter(
                        (item) => item.value == attrId
                    )[0];
                    createNewVariation(
                        attrOptionData?.label,
                        attrOptionData?.code,
                        attrId
                    );
                   }
                });
            } else {
                // size condition
                console.log(">>", this.appSizeRatios.appSizeScalesDetails);
    
                // if (this.appSizeRatios.appSizeScalesDetails.length < 2) {
                // let sizeData = this.appSizeRatios.appSizeScalesDetails[0];
                // this.siwiSizes.forEach((size) => {
                this.appSizeRatios.appSizeScalesDetails.forEach(
                    (sizeScale: any) => {
                        let arr = this.siwiSizes.filter(
                            (size) => size.code === sizeScale.sizeCode
                        );
                        console.log(">>", arr);
    
                        if (arr.length !== 0) {
                            createNewVariation(
                                sizeScale.sizeCode,
                                sizeScale.sizeCode,
                                arr[0].value
                            );
                        } else {
                            createNewVariation(
                                sizeScale.sizeCode,
                                sizeScale.sizeCode
                            );
                            // }
                        }
                    }
                );
    
                // });
                // } else {
                //     this.appSizeRatios.appSizeScalesDetails.forEach(
                //         (sizeDetailDto) => {
                //             createNewVariation(
                //                 sizeDetailDto.sizeCode,
                //                 sizeDetailDto.sizeCode
                //             );
                //         }
                //     );
                // }
            } 
//}

    }*/
    combine(index: number, _variation: VariationItemDto,oldAttributes) {
        let currentExtraAttr = this.selectedExtraAttributes[index];
        let totalSelectedExtraAttributes = this.selectedExtraAttributes.length;
        const createNewVariation = (
            attrLabel: string,
            attrCode: string,
            attrId?: number
        ) => {
            let ___varitation = VariationItemDto.fromJS(_variation);

            if (!___varitation.entityExtraData)
                ___varitation.entityExtraData = [];
            if (!___varitation.appItemPriceInfos)
                ___varitation.appItemPriceInfos = this.getParentProductPrices();
            if (
                ___varitation.entityExtraData.length ==
                totalSelectedExtraAttributes
            ) {
                ___varitation = new VariationItemDto();
                ___varitation.entityExtraData = [];
            }

            let entityExtraData = new AppEntityExtraDataDto({
                attributeId: currentExtraAttr.attributeId,
                attributeValue: attrLabel,
                attributeValueId: attrId,
                id: 0,
                entityId: 0,
                entityObjectTypeCode: currentExtraAttr.entityObjectTypeCode,
                attributeValueFkName: '0',
                entityObjectTypeName: '0',
                entityObjectTypeId: 0,
                attributeValueFkCode: attrCode?attrCode:'0',
                attributeCode: attrCode?attrCode:'0',
            });
            ___varitation.entityExtraData.push(entityExtraData);
            if (index < totalSelectedExtraAttributes - 1) {

                this.combine(index + 1, ___varitation,oldAttributes); //complete comibinig
            } else {
                //comibining done, now lets create a new variation row
                
                ___varitation.price = this.appItem.price;
                ___varitation.stockAvailability = 0;
                ___varitation.id = 0;
                ___varitation.entityAttachments = [];
                ___varitation.position = this.variationMatrices.length+1;

                for (
                    var i = 0;
                    i < ___varitation?.entityExtraData?.length;
                    i++
                ) {
                    if (i == 0) {
                        if (this.appItem.code)
                            ___varitation.code = this.appItem?.code;
                        else ___varitation.code = "";
                    }

                    ___varitation.code +=
                        "-" +
                        (___varitation?.entityExtraData[i]?.attributeCode ||
                            ___varitation?.entityExtraData[i]
                                ?.attributeValueFkCode);
                }
                let newVariation: VariationItemDto =
                    VariationItemDto.fromJS(___varitation);
                    
            // const curentItem=oldAttributes.filter((record)=>newVariation.code.includes(record.code.replace(/ /g,'')))[0];
             const curentItem=oldAttributes.filter((record)=>newVariation.code.replace(/\s+/g, '').replace(/-0+/g, '').includes(record.code.replace(/\s+/g, '').replace(/-0+/g, '')))[0];
             if(curentItem?.stockAvailability>0){
                newVariation.stockAvailability=curentItem.stockAvailability;
            }

            if(!curentItem){
                this.variationMatrices.push(newVariation);
                this.showNewVariation=true;
            }
            }
        };
            // if (currentExtraAttr.entityObjectTypeCode != this.sizeExtraAttrCode) {
                currentExtraAttr.selectedValues.forEach((attrId) => {
                    // if(attrId || attrId>=0){
                    let attrOptionData: any = currentExtraAttr.lookupData.filter(
                        (item) => item.value == attrId
                    )[0];
                    createNewVariation(
                        attrOptionData?.label,
                        attrOptionData?.code,
                        attrId
                    );
                  //  }
                });
            // } else {
            //     // size condition
            //     console.log(">>", this.appSizeRatios.appSizeScalesDetails);
                
            //     const sizeExtraAttr = this.selectedExtraAttributes.filter(extraAttr=>extraAttr.entityObjectTypeCode == this.sizeExtraAttrCode)
            //     sizeExtraAttr[0]?.selectedValues?.forEach(code=>{
            //         createNewVariation(
            //             code,
            //             code
            //         );
            //     })
              
            // }

           
          
    }

    setSelectionVariations(){
        this.selectedVaritaions =this.variationMatrices.filter((variation) => {
            return !variation.ssin;
        });
    }

    setPrice(price: any, dropdown: BsDropdownDirective) {
        this.selectedVaritaions.map((varitaion) => {
            let index = this._pricingHelpersService.getPricingIndex(
                varitaion.appItemPriceInfos,
                this.pricingFilter.level,
                this.pricingFilter.currencyId
            );
            if (index > -1) {
                varitaion.appItemPriceInfos[index].price = price;
            }
            return varitaion;
        });
        dropdown.hide();
    }

    handleSizeChange(value, extraDara, extraDaraIndex, tableRecordIndex){
    console.log(">>", value, extraDara, extraDaraIndex, tableRecordIndex)
    console.log(">>", this.primengTableHelper.records[tableRecordIndex].entityExtraData[extraDaraIndex].attributeValueId);
    this.primengTableHelper.records[tableRecordIndex].entityExtraData[extraDaraIndex].attributeValueId = Number(value)
    }
    handleColorChange(value, extraDara, extraDaraIndex, tableRecordIndex){
        
        this.primengTableHelper.records[tableRecordIndex].entityExtraData[extraDaraIndex].attributeValueId = Number(value);
    }

    deleteSelectedVariations(dropdown: BsDropdownDirective) {

        let sectedRecordsPositions: number[] = this.selectedVaritaions.reduce(
            (accum, variation) => {
                accum.push(variation.position);
                return accum;
            },
            []
        );

      let selectedRecord=  this.variationMatrices.filter((variation) => {
            return variation.ssin && sectedRecordsPositions.includes(variation.position)  ;
        });
        let sSINs=selectedRecord.map((variation) => {
            return variation.ssin;
        });
        
        this._appItemsServiceProxy.getItemVariationsToDelete(undefined,sSINs)
        .subscribe((res:VariationListToDeleteDto) => {
            if (res && res?.variationsInUse?.length >0) {
                Swal.fire({
                    title: "",
                    text:  res?.variationsInUse?.length==1 ? "Variation '"+res?.variationsInUse[0]?.code?.toString() + "' Is in use" :  "More than one variation in use",
                    icon: "info",
                    confirmButtonText:
                        "Ok",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    backdrop: true,
                    customClass: {
                        popup: "popup-class",
                        icon: "icon-class",
                        content: "content-class",
                        actions: "actions-class",
                        confirmButton: "confirm-button-class2",
                    },
                });


                //// remove the res Ssisns
                let sSINs=res?.variationCanBeDeleted.map((variation) => {
                    return variation.ssin;
                });

                this.selectedVaritaions= this.variationMatrices.filter((variation) => { 
                    return sSINs?.includes(variation.ssin)
                });
                let sectedRecordsPositions: number[] = this.selectedVaritaions.reduce(
                    (accum, variation) => {
                        accum.push(variation.position);
                        return accum;
                    },
                    []
                );
                this.variationMatrices = this.variationMatrices.filter((variation) => {
                    return !sectedRecordsPositions.includes(variation.position);
                });
            }
        else{
        this.variationMatrices = this.variationMatrices.filter((variation) => {
            return !sectedRecordsPositions.includes(variation.position);
        });
    }
        this.selectedVaritaions = [];
        this.setSelectionVariations();
        this.primengTableHelper.records = this.variationMatrices;

        dropdown.hide();
        this.updateVaritaionAttachments();
    
});
    }

    saveVariations() {
        if(this.selectedVaritaions && this.selectedVaritaions?.length>0){
        let sectedRecordsPositions: number[] = this.selectedVaritaions.reduce(
            (accum, variation) => {
                accum.push(variation.position);
                return accum;
            },
            []
        );
    let variationMatrices1=  this.variationMatrices.filter((variation) => {
            return sectedRecordsPositions.includes(variation.position);
        }); 
        
        let variationMatrices2=  this.variationMatrices.filter((variation) => {
            return variation.ssin; 
        });



        this.variationMatrices = [...variationMatrices1, ...variationMatrices2];
    }

        let invalidPrice = this.variationMatrices.some((variation) => {
            let defaultPriceindex =
                this._pricingHelpersService.getDefaultPricingIndex(
                    variation.appItemPriceInfos
                );
            const item = variation.appItemPriceInfos[defaultPriceindex];
            return (
                defaultPriceindex == -1 || isNaN(item.price) || item.price < 0
            );
        });
        if (invalidPrice) {
            return this.notify.error(
                this.l("PleaseCompletePricingAllVariationsFirst")
            );
        }
        this.variationMatrices?.forEach((variation) => {
            variation.appItemPriceInfos = variation.appItemPriceInfos.filter(
                (priceDto) => priceDto.code == "MSRP" || priceDto?.price > 0
            );
        });
        this.isListing ? this.selectedVaritaions : this.variationMatrices;
        let appItemSizesScaleInfo: AppItemSizesScaleInfo[] = undefined;
        
        const sizeIsSelected = this.selectedExtraAttributes.filter(
            (item) => item.entityObjectTypeCode == this.sizeExtraAttrCode
        )[0];

        if (sizeIsSelected)
            appItemSizesScaleInfo = [this.appSizeScales, this.appSizeRatios];
        const body: ApplyVariationOutput = {
            variation: this.isListing
                ? this.selectedVaritaions
                : this.variationMatrices,
            appItemSizesScaleInfo,
        };
        this.applyVariations.emit(body);
    }

    updateVaritaionAttachments() {
        let defaultExtraAttrId =
            this.defaultExtraAttrForAttachments.attributeId;

        this.variationAttachmentsSrcs = [];

        this.variationMatrices.map((variation, i) => {
            let filteredExtraAttrValue = variation.entityExtraData.filter(
                (item) => item.attributeId == defaultExtraAttrId
            );

            let extraAttrValue = filteredExtraAttrValue[0];
            let optionValue;
            let currentOptionAttachments;

            if(extraAttrValue.attributeValueId){
             optionValue =
                //extraAttrValue.entityObjectTypeCode == this.sizeExtraAttrCode
                    //? extraAttrValue.attributeCode
                    //: 
                    extraAttrValue.attributeValueId;

             currentOptionAttachments =
                this.defaultExtraAttrForAttachments.selectedValuesAttachments[
                    optionValue
                ];
            }
            else{
                optionValue=this.defaultExtraAttrForAttachments?.lookupData?.find(x=>x.code==extraAttrValue.attributeCode)?.value;

             currentOptionAttachments =
                this.defaultExtraAttrForAttachments.selectedValuesAttachments
                [
                    optionValue
                ];
            }
            // if(!currentOptionAttachments) {
            //     this.defaultExtraAttrForAttachments.selectedValuesAttachments[optionValue] = {
            //         attachmentSrcs : [""],
            //         entityAttachments : [],
            //         defaultImageIndex : -1,
            //         lookupData : []
            //     }
            // }
            // variation.entityAttachments = currentOptionAttachments.entityAttachments

            // handle add new and set default
            if (currentOptionAttachments) {
                currentOptionAttachments.entityAttachments.forEach((item) => {
                    let index = variation.entityAttachments.findIndex(
                        (varItem) => {
                            if (item.id)
                                return varItem.fileName === item.fileName;
                            else return varItem.guid === item.guid;
                        }
                    );
                    if (index > -1)
                        variation.entityAttachments[index].isDefault =
                            item.isDefault;
                    else variation.entityAttachments.push(item);
                });

                // handle delete
                variation.entityAttachments =
                    variation.entityAttachments.filter((varItem) => {
                        let isStillExist;
                        if (varItem.id)
                            isStillExist =
                                currentOptionAttachments.entityAttachments.some(
                                    (item) => item.fileName === varItem.fileName
                                );
                        else
                            isStillExist =
                                currentOptionAttachments.entityAttachments.some(
                                    (item) => item.guid === varItem.guid
                                );
                        return isStillExist;
                    });

                const defaultImageIndex = variation.entityAttachments.findIndex(
                    (item) => item.isDefault
                );

                const defaultImage: string =
                    currentOptionAttachments.attachmentSrcs[defaultImageIndex];

                this.variationAttachmentsSrcs.push(defaultImage);
            } else {
                this.variationAttachmentsSrcs.push(undefined);
            }

            return variation;
        });
    }

    reverseEngineerVariations() {
        // selectedExtraATtributes
        // selectedValues
        // attachemnts
        // parse image srcs
        let extraAttrIds = this.extraAttributes.map((row) => row.attributeId);

        let firstVariationRow = this.variationMatrices[0];
        // reverse engineer extra attributes selected extra attributes
        firstVariationRow.entityExtraData.forEach((elem) => {
            const currentExtraDataIndex = extraAttrIds.indexOf(
                elem.attributeId
            );
            this.extraAttributes[currentExtraDataIndex].selected = true;
            this.extraAttributes[currentExtraDataIndex].selectedValues = [];
            this.extraAttributes[currentExtraDataIndex].displayedSelectedValues=[];
        });

        let selectedExtraAttrIds = this.selectedExtraAttributes.map(
            (row) => row.attributeId
        );

        // reverse engineer extra attributes default attachment extra attribute
        for (let index = 0; index < this.variationMatrices.length; index++) {
            this.variationMatrices[index].entityAttachments.forEach((elem) => {
                let [extraAttrId, optionvalueId] = elem.attributes.split("=");
                const currentExtraDataIndex = selectedExtraAttrIds.indexOf(
                    Number(extraAttrId)
                );
                this.selectedExtraAttributes[
                    currentExtraDataIndex
                ].defaultForAttachment = true;
                this.selectedExtraAttributes[
                    currentExtraDataIndex
                ].selectedValuesAttachments = {};
            });
            if (this.variationMatrices[index].entityAttachments.length) break;
        }

        let selectedExtraAttr = this.selectedExtraAttributes;
        let defaultExtraAttrForAttachmentsId = this.variationMatrices.filter(
            (item) => item.entityAttachments.length === 0
        )[0]?.entityAttachments[0]?.attributes[0];
        let defaultExtraAttrForAttachmentsIndex;
        if (defaultExtraAttrForAttachmentsId)
            defaultExtraAttrForAttachmentsIndex =
                this.selectedExtraAttributes.filter(
                    (item) =>
                        String(item.attributeId) ==
                        defaultExtraAttrForAttachmentsId
                )[0];
        if (defaultExtraAttrForAttachmentsIndex)
            this.defaultExtraAttrForAttachments =
                selectedExtraAttr[defaultExtraAttrForAttachmentsIndex];
        this.variationMatrices?.forEach((variation) => {
            variation.entityExtraData?.forEach((item) => {
                let extraAttrId = item.attributeId;
                let currentExtraDataIndex =
                    selectedExtraAttrIds.indexOf(extraAttrId);
                // let isSizeExtraAttr: boolean =
                //     item.entityObjectTypeCode == this.sizeExtraAttrCode;
                let optionValueId = item.attributeValueId;
                let optionValueCode = item.attributeCode;
                // if (!isSizeExtraAttr && !optionValueId) {
                    optionValueId = selectedExtraAttr[
                        currentExtraDataIndex
                    ]?.lookupData?.filter(
                        (item) => item.code == optionValueCode
                    )[0]?.value;
                // }
                let attOptionValue = 
                    //isSizeExtraAttr
                    //? optionValueCode
                    //: 
                    optionValueId;
                let alreadySelectedValues: any[] =
                    selectedExtraAttr[currentExtraDataIndex]?.selectedValues;
                if (!alreadySelectedValues?.includes(attOptionValue as unknown))
                    alreadySelectedValues?.push(attOptionValue);
                let attachmentObj: { [key: number]: IVaritaionAttachment } =
                    selectedExtraAttr[currentExtraDataIndex]
                        ?.selectedValuesAttachments
                        ? selectedExtraAttr[currentExtraDataIndex]
                              ?.selectedValuesAttachments
                        : selectedExtraAttr[currentExtraDataIndex]?(selectedExtraAttr[
                              currentExtraDataIndex
                          ].selectedValuesAttachments = {}):null;
                // this.defaultExtraAttrForAttachments = selectedExtraAttr[currentExtraDataIndex]
                if(attachmentObj){
                 if (!attachmentObj[attOptionValue]) {
                    let selectedValue: SelectItem;
                    // if (!isSizeExtraAttr)
                        selectedValue = selectedExtraAttr[
                            currentExtraDataIndex
                        ].lookupData.filter(
                            (item) => item.value == attOptionValue
                        )[0];
                    attachmentObj[attOptionValue] = {
                        attachmentSrcs: [""],
                        entityAttachments: [],
                        defaultImageIndex: -1,
                        lookupData: selectedValue,
                    };
                }
                }

            });

            variation.entityAttachments.forEach((entityAttachment) => {
                let attributes = entityAttachment.attributes.split("=");
                let extraAttrId: string = attributes[0];
                let currentExtraDataIndex = selectedExtraAttrIds.indexOf(
                    Number(extraAttrId)
                );
                // let isSizeExtraAttr: boolean =
                //     selectedExtraAttr[currentExtraDataIndex]
                //         .entityObjectTypeCode == this.sizeExtraAttrCode;
               // let optionvalue =  Number(attributes[1]);
                    //isSizeExtraAttr
                    //? attributes[1]
                    //: 
                    let optionValueCode=attributes[1];
                    let optionvalue   = selectedExtraAttr[
                        currentExtraDataIndex
                    ]?.lookupData?.filter(
                        (item) => item.code == optionValueCode
                    )[0]?.value;

                    if (!optionvalue)
                    optionvalue = selectedExtraAttr[
                        currentExtraDataIndex
                    ]?.lookupData?.filter(
                        (item) => item.value == parseInt(optionValueCode)
                    )[0]?.value;

                let attachmentObj: { [key: number]: IVaritaionAttachment } =
                    selectedExtraAttr[currentExtraDataIndex]
                        .selectedValuesAttachments
                        ? selectedExtraAttr[currentExtraDataIndex]
                              .selectedValuesAttachments
                        : (selectedExtraAttr[
                              currentExtraDataIndex
                          ].selectedValuesAttachments = {});
                // this.defaultExtraAttrForAttachments = selectedExtraAttr[currentExtraDataIndex]
                if (!attachmentObj[optionvalue]) {
                    let selectedValue: SelectItem;
                    //if (!isSizeExtraAttr)
                        selectedValue = selectedExtraAttr[
                            currentExtraDataIndex
                        ].lookupData.filter(
                            (item) => item.value == optionvalue
                        )[0];
                    attachmentObj[optionvalue] = {
                        attachmentSrcs: [""],
                        entityAttachments: [],
                        defaultImageIndex: -1,
                        lookupData: selectedValue,
                    };
                }
                let imgUrl = this.adjustImageSrcUrl(entityAttachment);
                let optionAttachmentSrcs =
                    attachmentObj[optionvalue].attachmentSrcs;
                let optionEntityAttachments =
                    attachmentObj[optionvalue].entityAttachments;
                if (
                    !optionAttachmentSrcs.includes(imgUrl) ||
                    optionEntityAttachments.length <
                        variation.entityAttachments.length
                ) {
                    optionEntityAttachments.push(entityAttachment);
                    let index = 0;

                    optionAttachmentSrcs.unshift(imgUrl);
                    if (entityAttachment.isDefault) {
                        attachmentObj[optionvalue].defaultImageIndex = index;
                        const defaultImg = optionAttachmentSrcs[index];
                        this.variationAttachmentsSrcs.push(defaultImg);
                    } else {
                        attachmentObj[optionvalue].defaultImageIndex++;
                    }
                }
            });
        });
        let attachmentExist = this.variationMatrices.some(
            (item) => item.entityAttachments.length > 0
        );
        if (!attachmentExist) {
            this.setDefaultExtraAttributeForVariationAttachment(
                this.selectedExtraAttributes[0]
            );
        }

        this.defaultExtraAttrForAttachments =
            this.selectedExtraAttributes.filter(
                (elem) => elem.defaultForAttachment
            )[0];
        let firstValueSelected =
            this.defaultExtraAttrForAttachments.selectedValues[0];
        this.activeAttachmentOption =
            this.defaultExtraAttrForAttachments.selectedValuesAttachments[
                firstValueSelected
            ];

            this.firstAttachSelection= this.defaultExtraAttrForAttachments.selectedValuesAttachments[firstValueSelected];
                
         this.updateVaritaionAttachments();
        this.showVariationPhotos = true;
        this.sortVaritaionCombination();
    }
    sortVaritaionCombination() {
        
        let selectedExtraAttributesOrder: number[] =
            this.selectedExtraAttributes?.map((item) => item.attributeId);
        this.variationMatrices?.forEach((variation) => {
            variation.entityExtraData.sort((item, nextItem) => {
                let currentExtraDataIndex =
                    selectedExtraAttributesOrder.findIndex(
                        (extrAttr) => extrAttr === item.attributeId
                    );
                let nextExtraDataIndex = selectedExtraAttributesOrder.findIndex(
                    (extrAttr) => extrAttr === nextItem.attributeId
                );
                return currentExtraDataIndex - nextExtraDataIndex;
            });
        });
    }

    adjustImageSrcUrl(entityAttachment: AppEntityAttachmentDto) {
        const isBase64 = entityAttachment?.url?.match(/data:image/);
        let imgUrlSrc = isBase64
            ? `${entityAttachment.url}`
            : `${this.attachmentBaseUrl}/${entityAttachment.url}`;
        return imgUrlSrc;
    }
    cancelVariations() {
        this.cancel.emit(true);
    }
    // currentEntityObjectTypeCode: string
    // getAllEntityValuesList(getAllInputs: GetAllInputs) {
    //     const extraAttr = this.selectedExtraAttributes[this.activeExtraAttributeIndex]

    //     return this._appEntitiesServiceProxy.getAllEntitiesByTypeCodeWithPaging(
    //         undefined,
    //         getAllInputs.search,
    //         undefined,
    //         undefined,
    //         undefined,
    //         extraAttr.entityObjectTypeCode,
    //         undefined,
    //         undefined,
    //         undefined,
    //         getAllInputs.sortBy,
    //         getAllInputs.skipCount,
    //         getAllInputs.maxResultCount,
    //     )
    // }
    // handleGetAllEntityValuesList(getAllInputs: GetAllInputs) {
    //     this.getAllEntityValuesList(getAllInputs)
    //         .subscribe((result) => {
    //             this.appSelectionModal.renderData(result as PagedResultDto<LookupLabelDto>)
    //         })
    // }

    // async openCreateNewAppEntityModal() {
    //     const extraAttr = this.selectedExtraAttributes[this.activeExtraAttributeIndex]
    //     const getAllInputs = this.appSelectionModal.getAllInputs
    //     const results = await this.getAllEntityValuesList(getAllInputs).toPromise()
    //     const SelectionModalInputs: SelectionModalInputs<LookupLabelDto> = {
    //         showAdd: true,
    //         showEdit: true,
    //         showDelete: true,
    //         results,
    //         labelField: 'label',
    //         valueField: 'value',
    //         mode: SelectionMode.Multi,
    //         selections: extraAttr.selectedValues,
    //         title: extraAttr.entityObjectTypeCode
    //     }
    //     this.appSelectionModal.show(SelectionModalInputs)

    //     return
    //     // let extraAttr = this.selectedExtraAttributes[this.activeExtraAttributeIndex]
    //     // let config : ModalOptions = new ModalOptions()
    //     // config.class = 'right-modal slide-right-in'
    //     // let modalDefaultData :Partial<AppEntityListDynamicModalComponent> = {
    //     //     entityObjectType : {
    //     //         name : extraAttr.name,
    //     //         code : extraAttr.entityObjectTypeCode,//to be discussed with Farag
    //     //     },
    //     //     selectedRecords : extraAttr.selectedValues,
    //     //     acceptMultiValues : extraAttr.acceptMultipleValues
    //     // }
    //     // config.initialState = modalDefaultData
    //     // let modalRef:BsModalRef = this._BsModalService.show(AppEntityListDynamicModalComponent,config)
    //     // let subs : Subscription = this._BsModalService.onHidden.subscribe(()=>{
    //     //     this._extraAttributeDataService.getExtraAttributeLookupData(extraAttr.entityObjectTypeCode,extraAttr.lookupData,extraAttr)
    //     //     let modalRefData :AppEntityListDynamicModalComponent = modalRef.content
    //     //     if(modalRefData.selectionDone) extraAttr.selectedValues = modalRefData.selectedRecords
    //     //     if(!modalRef.content.isHiddenToCreateOrEdit)  subs.unsubscribe()
    //     // })
    // }
    // openCreateOrEdit() {
    //     let formInputs: FormInputs[] = []
    //     const extraAttr = this.selectedExtraAttributes[this.activeExtraAttributeIndex]
    //     const codeStyleObject = this.stylesObj
    //     const entityObjectType:string =extraAttr.entityObjectTypeCode;

    //     formInputs.push(
    //         new FormInputs({
    //             type: FormInputType.Text,
    //             name: 'Name',
    //             id: this.guid(),
    //             label: 'Name',
    //             required: true,
    //             placeholder: this.l('EnterName')
    //         }),
    //         new FormInputs<string,CodeInputConfig>({
    //             type: FormInputType.Code,
    //             name: 'Code', id: this.guid(),
    //             label: 'Code',
    //             customStyle: codeStyleObject,
    //             customClass: 'bg-white border-color',
    //             extraData: {
    //                 editMode:false,
    //                 entityObjectType
    //             }
    //         }),
    //         new FormInputs({
    //             type: FormInputType.Text,
    //             name: 'Description',
    //             id: this.guid(),
    //             label: 'Description',
    //             placeholder: this.l('EnterDescription')
    //         }),
    //     )
    //     this.appFormModal.show(formInputs)
    // }
    // onCreateOrEditHandler($event) {
    //     console.log($event)
    // }
    // onCancelHandler() {

    // }

    openCreateNewAppEntityModal() {
        
        let extraAttr =
            this.selectedExtraAttributes[this.activeExtraAttributeIndex];
        let config: ModalOptions = new ModalOptions();
        config.class = "right-modal slide-right-in";
        let modalDefaultData: Partial<AppEntityListDynamicModalComponent> = {
            entityObjectType: {
                name: extraAttr.name,
                code: extraAttr.entityObjectTypeCode, //to be discussed with Farag
            },
            selectedRecords: extraAttr.selectedValues,
            acceptMultiValues: extraAttr.acceptMultipleValues,
        };
        config.initialState = modalDefaultData;
        let modalRef: BsModalRef = this._BsModalService.show(
            AppEntityListDynamicModalComponent,
            config
        );
        let subs: Subscription = this._BsModalService.onHidden.subscribe(() => {
            const  subscription=  this._extraAttributeDataService.getExtraAttributeLookupData(
                extraAttr.entityObjectTypeCode,
                extraAttr.lookupData,
                extraAttr
            );
    
            subscription.subscribe((result) => {
                extraAttr.lookupData=result;
                extraAttr.displayedSelectedValues =  extraAttr.lookupData.filter(item => extraAttr.selectedValues.includes(item.value))
            });

            let modalRefData: AppEntityListDynamicModalComponent =
                modalRef.content;
            if (modalRefData.selectionDone){
                extraAttr.selectedValues = modalRefData.selectedRecords;
                extraAttr.displayedSelectedValues =  extraAttr.lookupData.filter(item => extraAttr.selectedValues.includes(item.value))
            }
            if (!modalRef.content.isHiddenToCreateOrEdit) subs.unsubscribe();
        });
    }
    filterLookup($event) {
        const search = $event.target.value;
        
        
        const extraAttr =
            this.selectedExtraAttributes[this.activeExtraAttributeIndex];

            extraAttr.displayedSelectedValues =  extraAttr.lookupData.filter(item => extraAttr.selectedValues.includes(item.value))


            if(search){
            extraAttr.displayedSelectedValues= extraAttr.displayedSelectedValues.filter((item) => {  
                  const itemLabel = (item.label as string)?.trim().toLowerCase();  
                    const searchValue = (search ?? '').trim().toLowerCase();   
                     return itemLabel.includes(searchValue);}
                     );
            }

        // extraAttr.displayedLookupData = extraAttr.lookupData.filter((item) =>
        //     (item.label as string)
        //         .trim()
        //         .toLowerCase()
        //         .includes(search.trim().toLowerCase())
        // );
    }

    getUnselectedProductVariations(productId: number) {
        this._appItemsServiceProxy.getVariations(productId).subscribe((res) => {
            const selectedVariationsParentIds: number[] =
                this.variationMatrices.map((item) => item.listingItemId);
            const alreadySelected = (id) =>
                selectedVariationsParentIds.includes(id);
            // filter unselected
            const parentProductUnselectedVariations: AppItemVariationDto[] =
                res.filter((parentVar) => !alreadySelected(parentVar.id));
            // remove ids from them or create new objects for them
            this.parentProductUnselectedVariations = [];
            let largestPosition = this.variationMatrices.reduce(
                (accum, item) => {
                    accum = item.position;
                    return accum;
                },
                0
            );
            parentProductUnselectedVariations.forEach((item) => {
                const variation = new VariationItemDto();
                variation.entityExtraData = [];
                item.entityExtraData.forEach((item) => {
                    variation.entityExtraData.push(
                        Object.assign(new AppEntityExtraDataDto(), item)
                    );
                });
                variation.parentId = item.id;
                variation.entityAttachments = [];
                variation.position = largestPosition + 1;
                largestPosition++;
                // variation.price = item.price
                this.parentProductUnselectedVariations.push(variation);
            });
        });
    }


    deepEqual(obj1: any, obj2: any): boolean {
        if (obj1 === obj2) return true;
    
        if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) return false;
    
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
    
        if (keys1.length !== keys2.length) return false;
    
        for (const key of keys1) {
          if (!keys2.includes(key)) return false;
          if (!this.deepEqual(obj1[key], obj2[key])) return false;
        }
    
        return true;
      }
    shouldDisableCreateVarButton(): boolean {
        return !this.variationPossibilities || 
          this.selectedExtraAttributes?.length < 2  || 
          !(this.selectedExtraAttributes?.length >= 2 && 
            this.selectedExtraAttributes[0]?.selectedValues?.length > 0 && 
            this.selectedExtraAttributes[1]?.selectedValues?.length > 0)  || 
            this.deepEqual(this.oldExtraAttributesData, this.selectedExtraAttributes)   && 
            this.variationMatrices?.length == this.variationPossibilities  ;

    }
    showUnselectedProductVariations() {
        this.hideUnselectedVariations = true;
        this.variationMatrices.push(...this.parentProductUnselectedVariations);
    }
    editExtraAtrributeSelection() {
      //  this.editVariationsOpend=true;
        this.oldExtraAttributesData = [];
        this.extraAttributes.forEach((elem) => {
            if(elem.selected){
            elem.displayedSelectedValues =  elem.lookupData.filter(item => elem.selectedValues.includes(item.value))
            this.oldExtraAttributesData.push(cloneDeep(elem));
            }
        });
        this.mapExtraAttrSelectionDataFromVariationMatrices();
       // this.showVariationSelectionMetaData = false;
        // this.showVariationPhotos = false;
      //  this.showVariations = false;
        this.activeExtraAttributeIndex = 0;
        this.oldDefaultExtraAttrForAttachments =
            this.defaultExtraAttrForAttachments;
        this.oldActiveAttachmentOption = this.activeAttachmentOption;
    }
    mapExtraAttrSelectionDataFromVariationMatrices() {
        
        // this.variationMatrices
        this.activeExtraAttributeIndex = this.selectedExtraAttributes.findIndex(
            (item) => item.selected
        );
    }
    sizeScaleFormIsValid: boolean = false;
    sizeRatioFormIsValid: boolean = false;
    sizeScalesChanged($event: AppItemSizesScaleInfo, formIsValid: boolean) {
        this.appSizeScales = $event;
        this.sizeScaleFormIsValid = formIsValid;
        this.showSizeRatio();
        this.editVariationsOpend=true;
    }
    showSizeRatio() {
        const colValues: AppSizeScalesDetailDto[] = [];
        const cellValues: AppSizeScalesDetailDto[] = [];
        let result: AppSizeScalesDetailDto[] = [];
        this.appSizeScales?.appSizeScalesDetails?.forEach((sizeScaleItem) => {
            const isColValue: boolean =
                Boolean(sizeScaleItem.sizeCode) &&
                //Boolean(sizeScaleItem.sizeId) &&
                Boolean(sizeScaleItem.dimensionName) &&
                Boolean(sizeScaleItem.d1Position);
            const isCellValue: boolean =
                Boolean(sizeScaleItem.sizeCode) &&
                //!Boolean(sizeScaleItem.sizeId) &&
                !Boolean(sizeScaleItem.dimensionName);
            let isAlreadyExistAsRatio: AppSizeScalesDetailDto =
                this.appSizeRatios?.appSizeScalesDetails?.filter(
                    (sizeRaioItem) =>
                        sizeRaioItem.sizeCode == sizeScaleItem.sizeCode
                )[0];
            if (isColValue)
                colValues.push(
                    new AppSizeScalesDetailDto({
                        ...sizeScaleItem,
                        id: isAlreadyExistAsRatio?.id || 0,
                        sizeRatio: isAlreadyExistAsRatio?.sizeRatio || 0,
                    })
                );
            else if (isCellValue)
                cellValues.push(
                    new AppSizeScalesDetailDto({
                        ...sizeScaleItem,
                        id: isAlreadyExistAsRatio?.id || 0,
                        sizeRatio: isAlreadyExistAsRatio?.sizeRatio || 0,
                    })
                );
        });
        if (cellValues.length) result = cellValues;
        else result = colValues;
        this.appSizeRatios = new AppItemSizesScaleInfo({
            ...this.appSizeScales,
            id: this.appSizeRatios?.id || 0,
            sizeScaleId: this.appSizeRatios?.sizeScaleId || 0,
            parentId: this.appSizeScales?.sizeScaleId || 0,
            name: this.appSizeRatios?.name,
            appSizeScalesDetails: result,
            code: this.appSizeRatios?.code,
        });
    }
    // sizeRatioisValid :boolean = false
    sizeRatioChanged($event: AppItemSizesScaleInfo, formIsValid: boolean) {
        this.sizeRatioFormIsValid = formIsValid;
        const uniqueTempIds = new Set<number>();
        const currentComponent=this;

        //this.editVariationsOpend=true;
        if(!this.removeSizeExtraAttr)this.appSizeRatios = $event;
        this.removeSizeExtraAttr=false;
        const selectedValuesCodes = this.appSizeRatios?.appSizeScalesDetails.map(
            (item) => item.sizeCode
        );
        
        const sizeIdsArray=this.appSizeRatios?.appSizeScalesDetails?.map(
            (item) => item.sizeId
        );
        const selectedValuesIds : number[] = []

        const sizeExtraAttr = this.extraAttributes?.filter(extraAtt=>extraAtt?.entityObjectTypeCode == this.sizeExtraAttrCode)[0]
        selectedValuesCodes.forEach(function(code,index){
            const isExist = sizeExtraAttr?.lookupData.filter(item=>item.code == code)[0] 
            if(!isExist||!sizeIdsArray[index]) {
                const tempAtt = new LookupLabelDto({
                    code,
                    value:currentComponent.getUniqueId(uniqueTempIds),
                    label:code,
                    stockAvailability:0,
                    isHostRecord:false,
                    hexaCode:undefined,
                    image:undefined
                    
                })
                sizeExtraAttr?.lookupData?.push(tempAtt)
                selectedValuesIds.push(tempAtt.value)
            }else{

                selectedValuesIds.push(sizeIdsArray[index])
            }    
            
        })
        

        const sizeSeletedExtraAttr = this.selectedExtraAttributes?.filter(extraAtt=>extraAtt?.entityObjectTypeCode == this.sizeExtraAttrCode)[0]
        if(selectedValuesIds.length>0){
            sizeSeletedExtraAttr.selectedValues = selectedValuesIds
        sizeExtraAttr.selectedValues = selectedValuesIds
    }
    }
    // extraAttributeOnChange($event:Event,extraAttr:IsVariationExtraAttribute){

    //     let isChecked = ($event.target as HTMLInputElement).checked
    //     // if( extraAttr.lookupData.length == 0 ) {
    //     //     isChecked = false
    //     //     this.notify.info("Can't select this attribute as it doesn't have values yet")
    //     // }

    //     if( isChecked ){
    //         extraAttr.selected = true
    //     } else {
    //         extraAttr.selected = false
    //     }
    // }
    onAttachmentOptionChange($event){
        this.activeAttachmentOption = $event.value ;
    }


    editSelectedAttributesVlaue(item) {
        let extraAttr =
        this.selectedExtraAttributes[this.activeExtraAttributeIndex];
      let  entityObjectType = {
            name: extraAttr.name,
            code: extraAttr.entityObjectTypeCode
        };
        const appEntity : AppEntityDto = new AppEntityDto()
        if(item) {
            appEntity.id = item?.value
        }
        this.createOreEditAppEntityModal.show(entityObjectType,appEntity)
    }
   async onCreateOrEditDoneHandler(){
      
        const extraAttr =
        this.selectedExtraAttributes[this.activeExtraAttributeIndex];
        const  subscription=  this._extraAttributeDataService.getExtraAttributeLookupData(
            extraAttr.entityObjectTypeCode,
            extraAttr.lookupData,
            extraAttr
        );

        subscription.subscribe((result) => {
            extraAttr.displayedSelectedValues = result.filter(item => extraAttr.selectedValues.includes(item.value));
          });
    }

    deselectSelectedAttributesValue(event){
        const extraAttr =
        this.selectedExtraAttributes[this.activeExtraAttributeIndex];
        extraAttr.displayedSelectedValues =extraAttr.displayedSelectedValues.filter(item => item.value !== event.value);
        extraAttr.selectedValues=extraAttr.selectedValues.filter(item => item !== event.value);
    }
    getExistingVariations(){
        this.activeExisttingVariation=true;
        this.activeNewVariation=false
        this.primengTableHelper.records=this.variationMatrices.filter((variation) => {
            return variation.ssin;
        });
    }
    isExistingVariationsSelected():boolean{
        let sectedRecordsPositions: number[] = this.selectedVaritaions.reduce(
            (accum, variation) => {
                accum.push(variation.position);
                return accum;
            },
            []
        );
        let selectedRecord=  this.variationMatrices.filter((variation) => {
            return variation.ssin &&  sectedRecordsPositions.includes(variation.position)  ;
        });


        if(selectedRecord && selectedRecord?.length>0) 
           return true
    else
       return false

    }


    getNewVariations(){
        this.activeExisttingVariation=false;
        this.activeNewVariation=true
        this.primengTableHelper.records=this.variationMatrices.filter((variation) => {
            return !variation.ssin;
        });
    }

}
export interface ApplyVariationOutput {
    variation: VariationItemDto[];
    appItemSizesScaleInfo: AppItemSizesScaleInfo[];
}
