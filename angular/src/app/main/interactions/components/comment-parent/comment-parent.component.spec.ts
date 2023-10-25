import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CommentParentComponent } from './comment-parent.component';

describe('CommentParentComponent', () => {
  let component: CommentParentComponent;
  let fixture: ComponentFixture<CommentParentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CommentParentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
