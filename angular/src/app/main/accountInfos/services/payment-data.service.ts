import { Injectable } from '@angular/core';

@Injectable()
export class PaymentDataService {
    years : {label:string,value:number}[] []
    monthsAsString : string[] = ["january", "february", "march", 'april', 'may', 'june', 'july','august', 'september', 'october', 'november', 'december']
    months : {label:string,value:any}[] = []
    constructor() {
        this.getYearsOptions() // fill the years options array with data
        this.getMonthsOptions() // fill the months options array with data

     }
    getYearsOptions() {
        let years : any = Array(6).fill(0) // create Array of length 12 filled with undefined
        let today = new Date().getFullYear()
        this.years = years.map((item, index) => {
            let _year = today + index
            return { label:_year, value:String(_year).substring(2,4) }
        })
    }
    getMonthsOptions(){
        this.monthsAsString.forEach((monthName,index)=>{
            let monthNumber = index < 9 ? '0' + (index+1) : String(index+1) // ex : 01,02,10
            this.months.push({label:monthName,value: monthNumber })
        })
    }

}
