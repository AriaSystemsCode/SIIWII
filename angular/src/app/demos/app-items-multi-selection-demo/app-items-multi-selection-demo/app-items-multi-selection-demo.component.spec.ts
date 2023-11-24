import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppItemsMultiSelectionDemoComponent } from './app-items-multi-selection-demo.component';

describe('AppItemsMultiSelectionDemoComponent', () => {
  let component: AppItemsMultiSelectionDemoComponent;
  let fixture: ComponentFixture<AppItemsMultiSelectionDemoComponent>;

  beforeEach(async(() => {
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
