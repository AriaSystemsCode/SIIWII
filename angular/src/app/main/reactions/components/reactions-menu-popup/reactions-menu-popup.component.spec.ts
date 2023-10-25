import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ReactionsMenuPopupComponent } from './reactions-menu-popup.component';

describe('ReactionsMenuPopupComponent', () => {
  let component: ReactionsMenuPopupComponent;
  let fixture: ComponentFixture<ReactionsMenuPopupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReactionsMenuPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReactionsMenuPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
