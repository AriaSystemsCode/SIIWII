import { FormInputType } from "./FormInputType";
import { IFormInputs } from "./IFormInputs";

export class FormInputs<Value=any,ExtraData=any> implements IFormInputs<Value,ExtraData>{
  type: FormInputType;
  name: string;
  id: string;
  placeholder?: string;
  label: string;
  required?: boolean;
  pattern?: RegExp;
  initialValue?:Value
  customStyle?: {
    [klass: string]: any;
  }
  customClass?:string
  extraData?:ExtraData
  position?:number
  defaultValue?:any
  min?:number
  max?:number
  constructor(data?: IFormInputs<Value,ExtraData>) {
    if (data) {
        for (var property in data) {
            if (data.hasOwnProperty(property))
                (<any>this)[property] = (<any>data)[property];
        }
    }
  }
}