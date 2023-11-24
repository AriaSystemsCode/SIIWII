import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactionsStatsComponent } from './reactions-stats.component';

describe('ReactionsStatsComponent', () => {
  let component: ReactionsStatsComponent;
  let fixture: ComponentFixture<ReactionsStatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReactionsStatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReactionsStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
