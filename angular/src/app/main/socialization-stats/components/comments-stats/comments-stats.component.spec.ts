import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CommentsStatsComponent } from './comments-stats.component';

describe('CommentsStatsComponent', () => {
  let component: CommentsStatsComponent;
  let fixture: ComponentFixture<CommentsStatsComponent>;

  beforeEach(waitForAsync(() => {
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
