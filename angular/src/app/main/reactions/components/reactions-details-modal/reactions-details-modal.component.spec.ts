import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactionsDetailsModalComponent } from './reactions-details-modal.component';

describe('ReactionsDetailsModalComponent', () => {
  let component: ReactionsDetailsModalComponent;
  let fixture: ComponentFixture<ReactionsDetailsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReactionsDetailsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReactionsDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
