import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOrEditSpreadsheetComponent } from './create-or-edit-spreadsheet.component';

describe('CreateOrEditSpreadsheetComponent', () => {
  let component: CreateOrEditSpreadsheetComponent;
  let fixture: ComponentFixture<CreateOrEditSpreadsheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateOrEditSpreadsheetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateOrEditSpreadsheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
