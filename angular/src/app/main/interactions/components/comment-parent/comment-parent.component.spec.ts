import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentParentComponent } from './comment-parent.component';

describe('CommentParentComponent', () => {
  let component: CommentParentComponent;
  let fixture: ComponentFixture<CommentParentComponent>;

  beforeEach(async(() => {
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
