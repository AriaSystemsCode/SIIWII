import { AppComponentBase } from '@shared/common/app-component-base';
import { Injector } from '@angular/core';

export abstract class InputTypeComponentBase extends AppComponentBase {
    selectedValues: string[];
    allValues: string[];
    abstract getSelectedValues(): string[];

    constructor(
        injector: Injector,
    ) {
        super(injector);
        this.selectedValues = injector.get('selectedValues');
        this.allValues = injector.get('allValues');
        injector.get('componentInstance')(this);
    }
}
