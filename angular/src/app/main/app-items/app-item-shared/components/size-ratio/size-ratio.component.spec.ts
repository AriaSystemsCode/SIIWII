import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SizeRatioComponent } from './size-ratio.component';

describe('SizeRatioComponent', () => {
  let component: SizeRatioComponent;
  let fixture: ComponentFixture<SizeRatioComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SizeRatioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SizeRatioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
