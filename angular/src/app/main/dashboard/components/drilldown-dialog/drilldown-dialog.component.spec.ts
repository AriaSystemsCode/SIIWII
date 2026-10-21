import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrilldownDialogComponent } from './drilldown-dialog.component';

describe('DrilldownDialogComponent', () => {
  let component: DrilldownDialogComponent;
  let fixture: ComponentFixture<DrilldownDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DrilldownDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrilldownDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
