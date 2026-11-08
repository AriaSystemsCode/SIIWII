import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpreadsheetDataPanelComponent } from './spreadsheet-data-panel.component';

describe('SpreadsheetDataPanelComponent', () => {
  let component: SpreadsheetDataPanelComponent;
  let fixture: ComponentFixture<SpreadsheetDataPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpreadsheetDataPanelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpreadsheetDataPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
