import { Injectable } from '@angular/core';
import { FieldManagerEntityNode, FieldManagerItem } from './field-manager.model';

@Injectable()
export class FieldManagerService {
    /////i51-Instead of BE Integration
    private nextId = 3;
    private items: FieldManagerItem[] = [
        {
            id: 1,
            code: 'F001',
            name: 'ContactSSIN',
            description: 'Internal code used by SIIWII platform to Identify the contact',
            type: 'String -Textbox',
            createdUser: 'System User',
            entityId: 2,
            tables: 'Purchase Order',
            status: 'Active',
            revision: 0,
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
            active: true
        },
        {
            id: 2,
            code: 'F002',
            name: 'ItemSSIN',
            description: 'Internal code used by SIIWII platform to Identify the item',
            type: 'String -Textbox',
            createdUser: 'System User',
            entityId: 2,
            tables: 'Purchase Order',
            status: 'Active',
            revision: 0,
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
            active: true
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
            active: true
        }
    ];

    getAll(): FieldManagerItem[] {
        return [...this.items];
    }

    getById(id: number): FieldManagerItem | undefined {
        return this.items.find(item => item.id === id);
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

    delete(id: number): void {
        this.items = this.items.filter(item => item.id !== id);
    }
}
