import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SelectionModalComponent } from './selection-modal.component';

describe('SelectionModalComponent', () => {
  let component: SelectionModalComponent;
  let fixture: ComponentFixture<SelectionModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectionModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
