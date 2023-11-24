import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SizeScaleComponent } from './size-scale.component';

describe('SizeScaleComponent', () => {
  let component: SizeScaleComponent;
  let fixture: ComponentFixture<SizeScaleComponent>;

  beforeEach(async(() => {
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
