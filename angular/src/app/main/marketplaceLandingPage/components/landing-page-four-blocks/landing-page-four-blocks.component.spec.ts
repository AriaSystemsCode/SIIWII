import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingPageFourBlocksComponent } from './landing-page-four-blocks.component';

describe('LandingPageFourBlocksComponent', () => {
  let component: LandingPageFourBlocksComponent;
  let fixture: ComponentFixture<LandingPageFourBlocksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LandingPageFourBlocksComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingPageFourBlocksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
