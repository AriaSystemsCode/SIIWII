import { Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AppComponentBase } from '@shared/common/app-component-base';

export type TransactionsFilterMode = 'header' | 'details';

@Component({
    selector: 'app-transactions-filter',
    templateUrl: './transactions-filter.component.html',
    styleUrls: ['./transactions-filter.component.scss']
})
export class TransactionsFilterComponent extends AppComponentBase implements OnInit, OnDestroy {

    @Input() form: FormGroup;
    @Input() mode: TransactionsFilterMode = 'header';
    @Input() statusOptions: SelectItem[] = [];
    @Input() isArabic = false;

    @Output() filterChange = new EventEmitter<void>();
    @Output() closed = new EventEmitter<void>();

    private readonly headerKeys = [
        'sellerNameFilter', 'buyerNameFilter', 'codeFilter', 'statusFilter',
        'minCreateDateFilter', 'maxCreateDateFilter',
        'minCompleteDateFilter', 'maxCompleteDateFilter',
        'referenceNumberFilter'
    ];

    private readonly detailKeys = [
        'transactionNumberFilter', 'variationCodeFilter',
        'minPrice', 'maxPrice', 'minAmount', 'maxAmount'
    ];

    private typing$ = new Subject<void>();
    private sub = new Subscription();

    constructor(injector: Injector) {
        super(injector);
    }

    ngOnInit(): void {
        this.sub.add(
            this.typing$.pipe(debounceTime(400)).subscribe(() => this.filterChange.emit())
        );
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }

    onTyping(): void {
        this.typing$.next();
    }

    emitNow(): void {
        this.filterChange.emit();
    }

    clear(): void {
        const keys = this.mode === 'header' ? this.headerKeys : this.detailKeys;
        const patch: any = {};
        keys.forEach(k => patch[k] = k === 'statusFilter' ? 0 : undefined);
        this.form.patchValue(patch);
        this.emitNow();
    }
}