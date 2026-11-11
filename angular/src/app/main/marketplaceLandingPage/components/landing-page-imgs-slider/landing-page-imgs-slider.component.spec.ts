import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingPageImgsSliderComponent } from './landing-page-imgs-slider.component';

describe('LandingPageImgsSliderComponent', () => {
  let component: LandingPageImgsSliderComponent;
  let fixture: ComponentFixture<LandingPageImgsSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LandingPageImgsSliderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingPageImgsSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
