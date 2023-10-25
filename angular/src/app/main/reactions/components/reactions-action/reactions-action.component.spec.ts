import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ReactionsActionComponent } from './reactions-action.component';

describe('ReactionsActionComponent', () => {
  let component: ReactionsActionComponent;
  let fixture: ComponentFixture<ReactionsActionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReactionsActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReactionsActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
