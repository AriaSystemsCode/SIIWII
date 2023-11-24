import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewsStatsComponent } from './views-stats.component';

describe('ViewsStatsComponent', () => {
  let component: ViewsStatsComponent;
  let fixture: ComponentFixture<ViewsStatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewsStatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewsStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
