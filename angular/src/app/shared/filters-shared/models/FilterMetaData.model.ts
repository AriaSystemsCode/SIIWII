import {IFilterMetaData} from './FilterMetaData.interface'

export class FilterMetaData<T> {
    list: T
    collapsedDisplayedListCount: number = 3
    displayedList: T
    listTotalCount: number
    listMaxResultCount: number
    listSkipCount: number = 0
    constructor(data: IFilterMetaData<T>) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property)) {
                    (<any>this)[property] = (<any>data)[property];
                }
            }
            this.setDefaultData()
        }
    }
    setDefaultData() {
        this.listMaxResultCount = this.collapsedDisplayedListCount
    }
}


// export class FilterMetaData<T> {
//     private _list: T
//     private _listFormControl: FormControl = new FormControl()
//     _listValueChanges$ : Observable<any> = this._listFormControl.valueChanges
//     collapsedDisplayedListCount: number = 3
//     displayedList: T
//     listTotalCount: number
//     listMaxResultCount: number
//     listSkipCount: number = 0
//     set list ( l : T) {
//         this._list = l
//         this._listFormControl.setValue(l)
//     }
//     get list () { return this._list }
//     constructor(data: IFilterMetaData<T>) {
//         if (data) {
//             for (var property in data) {
//                 if (data.hasOwnProperty(property)) {
//                     (<any>this)[property] = (<any>data)[property];
//                 }
//             }
//             this.setDefaultData()
//         }
//     }
//     setDefaultData() {
//         this.listMaxResultCount = this.collapsedDisplayedListCount
//     }
// }
