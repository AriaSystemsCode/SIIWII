import { Injectable } from '@angular/core';
import { FieldManagerEntityNode, FieldManagerItem } from './field-manager.model';

export interface FieldManagerRevision {
    item: FieldManagerItem;
    revisionSequence: string;
    createdBy: string;
    createdOn: Date;
    status: 'Current' | 'Previous';
}

@Injectable()
export class FieldManagerService {
    /////i51-Instead of BE Integration
    private nextId = 7;
    private revisions: { [itemId: number]: FieldManagerRevision[] } = {};
    private items: FieldManagerItem[] = [
        {
            id: 1,
            code: 'F001',
            name: 'ContactSSIN',
            description: 'Internal code used by SIIWII platform to Identify the contact',
            type: 'String - Textbox',
            createdUser: 'System User',
            entityId: 2,
            tables: 'Purchase Order',
            status: 'Active',
            revision: 0,
            revisionSequence: '01',
            fieldLevel: 'Application',
            trackingNumber: 'Iteration_40',
            allowNull: false,
            length: 12,
            allowMultiSelect: false,
            decimals: 0,
            dateFormat: 'mm/dd/yyyy',
            defaultValue: '',
            visible: true,
            editable: false,
            dropdownOptions: [],
            extraData: false,
            required: true,
            active: true,
            canSync: true
        },
        {
            id: 2,
            code: 'F002',
            name: 'ItemSSIN',
            description: 'Internal code used by SIIWII platform to Identify the item',
            type: 'String - Textbox',
            createdUser: 'System User',
            entityId: 2,
            tables: 'Purchase Order',
            status: 'Active',
            revision: 0,
            revisionSequence: '02',
            fieldLevel: 'Application',
            trackingNumber: 'Iteration_41',
            allowNull: false,
            length: 12,
            allowMultiSelect: false,
            decimals: 0,
            dateFormat: 'mm/dd/yyyy',
            defaultValue: '',
            visible: true,
            editable: false,
            dropdownOptions: [],
            extraData: false,
            required: false,
            active: true,
            canSync: false
        },
        {
            id: 3,
            code: 'F003',
            name: 'CompleteDate',
            description: 'The date when the transaction is completed',
            type: 'Date - Date picker',
            createdUser: 'Esraa',
            entityId: 2,
            tables: 'Purchase Order',
            status: 'Proposed',
            revision: 0,
            revisionSequence: '03',
            fieldLevel: 'Application',
            trackingNumber: 'Iteration X600',
            allowNull: true,
            length: 0,
            allowMultiSelect: false,
            decimals: 0,
            dateFormat: 'mm/dd/yyyy',
            defaultValue: '',
            visible: true,
            editable: true,
            dropdownOptions: [
                { option: 'Option 1', value: '01' },
                { option: 'Option 2', value: '02' }
            ],
            extraData: true,
            required: false,
            active: true,
            canSync: true
        },
        {
            id: 4,
            code: 'F004',
            name: 'CompleteDate',
            description: 'The date when the transaction is completed',
            type: 'Date - Date picker',
            createdUser: 'Esraa',
            entityId: 3,
            tables: 'Sales Order',
            status: 'Proposed',
            revision: 0,
            revisionSequence: '04',
            fieldLevel: 'Application',
            trackingNumber: 'Iteration X600',
            allowNull: true,
            length: 0,
            allowMultiSelect: false,
            decimals: 0,
            dateFormat: 'mm/dd/yyyy',
            defaultValue: '',
            visible: true,
            editable: true,
            dropdownOptions: [
                { option: 'Option 1', value: '01' },
                { option: 'Option 2', value: '02' }
            ],
            extraData: true,
            required: false,
            active: true,
            canSync: true
        },
        {
            id: 5,
            code: 'F005',
            name: 'CompleteDate',
            description: 'The date when the transaction is completed',
            type: 'Date - Date picker',
            createdUser: 'Esraa',
            entityId: 3,
            tables: 'Sales Order',
            status: 'Proposed',
            revision: 0,
            revisionSequence: '05',
            fieldLevel: 'Application',
            trackingNumber: 'Iteration X600',
            allowNull: true,
            length: 0,
            allowMultiSelect: false,
            decimals: 0,
            dateFormat: 'mm/dd/yyyy',
            defaultValue: '',
            visible: true,
            editable: true,
            dropdownOptions: [
                { option: 'Option 1', value: '01' },
                { option: 'Option 2', value: '02' }
            ],
            extraData: true,
            required: false,
            active: true,
            canSync: false
        },
        {
            id: 6,
            code: 'F006',
            name: 'CompleteDate',
            description: 'The date when the transaction is completed',
            type: 'Date - Date picker',
            createdUser: 'Esraa',
            entityId: 3,
            tables: 'Sales Order',
            status: 'Proposed',
            revision: 0,
            revisionSequence: '06',
            fieldLevel: 'Application',
            trackingNumber: 'Iteration X600',
            allowNull: true,
            length: 0,
            allowMultiSelect: false,
            decimals: 0,
            dateFormat: 'mm/dd/yyyy',
            defaultValue: '',
            visible: true,
            editable: true,
            dropdownOptions: [
                { option: 'Option 1', value: '01' },
                { option: 'Option 2', value: '02' }
            ],
            extraData: false,
            required: false,
            active: true,
            canSync: true
        }
    ];

    constructor() {
        // Temporary mock rows make it possible to verify the table's vertical scrolling.
        const template = this.items[2];
        const testRows = Array.from({ length: 80 }, (_, index) => {
            const id = this.nextId + index;
            return {
                ...template,
                id,
                code: `TEST${('000' + id).slice(-3)}`,
                name: `ScrollTestField${id}`,
                description: `Temporary scroll test field ${id}`,
                type: index % 2 === 0 ? 'Date - Date picker' : 'String - Textbox',
                createdUser: index % 2 === 0 ? 'Esraa' : 'System User',
                entityId: 3,
                tables: 'Sales Order',
                status: index % 2 === 0 ? 'Proposed' : 'Active',
                revisionSequence: ('00' + id).slice(-2),
                fieldLevel: index % 2 === 0 ? 'Application' : 'System',
                trackingNumber: `Scroll test ${id}`,
                extraData: index % 3 !== 0,
                dropdownOptions: template.dropdownOptions.map(option => ({ ...option }))
            };
        });

        this.items.push(...testRows);
        this.nextId += testRows.length;
    }

    getAll(): FieldManagerItem[] {
        return [...this.items];
    }

    //i51-Get Field
    getById(id: number): FieldManagerItem | undefined {
        return this.items.find(item => item.id === id);
    }

    getRevisionHistory(item: FieldManagerItem): FieldManagerRevision[] {
        if (!this.revisions[item.id]) {
            const currentNumber = Math.max(0, parseInt(item.revisionSequence, 10) || 0);
            const firstNumber = Math.max(0, currentNumber - 5);
            const revisions: FieldManagerRevision[] = [];
            for (let number = firstNumber; number <= currentNumber; number++) {
                const snapshot = this.copyItem(item);
                snapshot.revisionSequence = ('00' + number).slice(-2);
                revisions.push({
                    item: snapshot,
                    revisionSequence: snapshot.revisionSequence,
                    createdBy: number === currentNumber ? (item.createdUser || 'System User') : this.revisionAuthor(number),
                    createdOn: new Date(Date.now() - (currentNumber - number) * 86400000),
                    status: number === currentNumber ? 'Current' : 'Previous'
                });
            }
            this.revisions[item.id] = revisions;
        }

        return this.revisions[item.id]
            .map(revision => ({ ...revision, item: this.copyItem(revision.item) }))
            .sort((first, second) => parseInt(second.revisionSequence, 10) - parseInt(first.revisionSequence, 10));
    }

    saveRevision(itemId: number, source: FieldManagerItem, revisionSequence: string): FieldManagerItem {
        const history = this.getRevisionHistory(source);
        history.forEach(revision => revision.status = 'Previous');
        const saved = this.copyItem({
            ...source,
            id: itemId,
            revision: parseInt(revisionSequence, 10) || 0,
            revisionSequence
        });
        const newRevision: FieldManagerRevision = {
            item: saved,
            revisionSequence,
            createdBy: source.createdUser || 'Current User',
            createdOn: new Date(),
            status: 'Current'
        };
        const existingIndex = history.findIndex(revision => revision.revisionSequence === revisionSequence);
        if (existingIndex >= 0) {
            history.splice(existingIndex, 1);
        }
        history.push(newRevision);
        this.revisions[itemId] = history;

        const itemIndex = this.items.findIndex(existing => existing.id === itemId);
        if (itemIndex >= 0) {
            this.items[itemIndex] = this.copyItem(saved);
        }
        return this.copyItem(saved);
    }

    private copyItem(item: FieldManagerItem): FieldManagerItem {
        return {
            ...item,
            dropdownOptions: (item.dropdownOptions || []).map(option => ({ ...option }))
        };
    }

    private revisionAuthor(number: number): string {
        const authors = ['Tom Carter', 'Lisa Green', 'Mike Brown', 'Sarah Lee', 'Adam Johns'];
        return authors[(number - 1) % authors.length];
    }

    getEntityTree(): FieldManagerEntityNode[] {
        return [
            {
                id: 1,
                name: 'Transactions',
                children: [
                    {
                        id: 7,
                        name: 'AppTransactionHeader',
                        children: [
                            { id: 2, name: 'Purchase Order' },
                            { id: 3, name: 'Sales Order' }
                        ]
                    },
                    { id: 8, name: 'AppTransactionDetail' },
                    { id: 9, name: 'AppTransactionContacts' }
                ]
            },
            {
                id: 4,
                name: 'Contacts',
                children: [
                    {
                        id: 10,
                        name: 'AppContacts',
                        children: [
                            { id: 5, name: 'Business' },
                            { id: 6, name: 'Personal' },
                            { id: 11, name: 'Group' }
                        ]
                    }
                ]
            },
            { id: 12, name: 'Marketplace Contacts' },
            {
                id: 13,
                name: 'Items',
                children: [
                    {
                        id: 14,
                        name: 'AppItems',
                        children: [
                            {
                                id: 15,
                                name: 'Products',
                                children: [
                                    { id: 16, name: 'Dresses' }
                                ]
                            }
                        ]
                    }
                ]
            },
            { id: 17, name: 'Marketplace Items' },
            { id: 18, name: 'Messages' },
            { id: 19, name: 'Posts' },
            { id: 20, name: 'Events' },
            { id: 21, name: 'Linesheet' },
            { id: 22, name: 'Subscription plans' }
        ];
    }

    getByEntity(entityId: number): FieldManagerItem[] {
        return this.items.filter(item => item.entityId === entityId);
    }

    save(item: FieldManagerItem): FieldManagerItem {
        item = { ...item };
        if (item.id) {
            const index = this.items.findIndex(existing => existing.id === item.id);
            if (index !== -1) {
                this.items[index] = { ...item };
                return this.items[index];
            }
        }

        const savedItem = { ...item, id: this.nextId++ };
        this.items.push(savedItem);
        return savedItem;
    }

    addExisting(item: FieldManagerItem, entityId: number, tableName: string): FieldManagerItem {
        return this.save({
            ...item,
            id: 0,
            entityId,
            tables: tableName,
            revision: 0,
            revisionSequence: '00',
            extraData: false
        });
    }

    delete(id: number): void {
        this.items = this.items.filter(item => item.id !== id);
    }
}
