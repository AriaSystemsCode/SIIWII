import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SizeRatioComponent } from './size-ratio.component';

describe('SizeRatioComponent', () => {
  let component: SizeRatioComponent;
  let fixture: ComponentFixture<SizeRatioComponent>;

  beforeEach(async(() => {
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
