import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingPageBlockCardComponent } from './landing-page-block-card.component';

describe('LandingPageBlockCardComponent', () => {
  let component: LandingPageBlockCardComponent;
  let fixture: ComponentFixture<LandingPageBlockCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LandingPageBlockCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingPageBlockCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
