import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentsStatsComponent } from './comments-stats.component';

describe('CommentsStatsComponent', () => {
  let component: CommentsStatsComponent;
  let fixture: ComponentFixture<CommentsStatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommentsStatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentsStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
