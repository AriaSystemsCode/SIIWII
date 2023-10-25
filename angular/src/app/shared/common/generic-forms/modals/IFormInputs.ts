import { NgStyle } from "@angular/common";
import { SelectItemDto } from "@shared/service-proxies/service-proxies";
import { FormInputType } from "./FormInputType";

export interface IFormInputs<Value=any,ExtraData=any> {
  type: FormInputType;
  name: string;
  id: string;
  placeholder?: string;
  label: string;
  required?: boolean;
  pattern?: RegExp;
  initialValue?:Value,
  customStyle?: {
    [klass: string]: any;
  },
  customClass?:string
  extraData?:ExtraData
  position?:number
  defaultValue?:any
  min?:number
  max?:number
}
export interface CodeInputConfig {
  editMode:boolean,
  entityObjectType:string
}

export interface DropDownInputConfig {
  source:SelectItemDto[]
}