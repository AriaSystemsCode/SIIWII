import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AppItemsMultiSelectionDemoComponent } from './app-items-multi-selection-demo.component';

describe('AppItemsMultiSelectionDemoComponent', () => {
  let component: AppItemsMultiSelectionDemoComponent;
  let fixture: ComponentFixture<AppItemsMultiSelectionDemoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AppItemsMultiSelectionDemoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppItemsMultiSelectionDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
