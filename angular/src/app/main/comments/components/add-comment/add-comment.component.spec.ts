import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddCommentComponent } from './add-comment.component';

describe('AddCommentComponent', () => {
  let component: AddCommentComponent;
  let fixture: ComponentFixture<AddCommentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCommentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
