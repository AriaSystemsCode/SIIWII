import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SizeScaleComponent } from './size-scale.component';

describe('SizeScaleComponent', () => {
  let component: SizeScaleComponent;
  let fixture: ComponentFixture<SizeScaleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SizeScaleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SizeScaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
