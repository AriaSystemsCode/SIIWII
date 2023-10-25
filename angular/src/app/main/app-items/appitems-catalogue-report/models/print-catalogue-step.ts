import { PrintCatalogueStepsEnum } from "./print-catalogue-steps.enum"
export interface PrintCatalogueStepI {
    printCatalogueStepsEnum:PrintCatalogueStepsEnum
    title:string
    icon:string
}
export class PrintCatalogueStep implements PrintCatalogueStepI {
    printCatalogueStepsEnum:PrintCatalogueStepsEnum
    title:string
    icon:string
    constructor(body?:PrintCatalogueStepI){
        if(!body) return

        Object.keys(body).forEach(key => {
            const value = body[key]
            this[key] = value
        });
    }
}
