import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable, scheduled } from 'rxjs';


export class DateFormValidations {
  
  static validateDateRangeAsync(fromDateInputName:string, toDateInputName:string) :  AsyncValidatorFn{
    return (control: AbstractControl):Observable<ValidationErrors|null> => {
      return new Observable<ValidationErrors|null>((subs)=>{
        const startDateCtrl = control.get(fromDateInputName);
        const endDateCtrl = control.get(toDateInputName);
        if(endDateCtrl?.value && startDateCtrl?.value) {
          const startDate = new Date(endDateCtrl.value).getTime()
          const endDate = new Date(endDateCtrl.value).getTime()
          subs.next(startDate <= endDate  ? null : { InvalidDateRange: true })
        } else {
          subs.next(null)
        }
      })
    };
  }
  static validateDateRange(fromDateInputName:string, toDateInputName:string) :  ValidatorFn{
    return (control: AbstractControl):ValidationErrors|null => {
        const startDateCtrl = control.get(fromDateInputName);
        const endDateCtrl = control.get(toDateInputName);
        if(endDateCtrl?.value && startDateCtrl?.value) {
          const startDate = new Date(endDateCtrl.value).getTime()
          const endDate = new Date(endDateCtrl.value).getTime()
          return startDate <= endDate  ? null : { InvalidDateRange: true }
        } else {
          return null
        }
      }
  }
  static validateDate(comprator : Function,value:Date) :  ValidatorFn{
    return (control: AbstractControl): ValidationErrors | null => {
      if(control?.value) {
        const date = new Date(control.value).getTime()
        return comprator(control.value,value)  ? null : { InvalidDateRange: true }
      } else {
        return null
      }
    };
  }
}
