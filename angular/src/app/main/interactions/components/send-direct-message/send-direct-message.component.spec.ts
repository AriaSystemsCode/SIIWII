import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendDirectMessageComponent } from './send-direct-message.component';

describe('SendDirectMessageComponent', () => {
  let component: SendDirectMessageComponent;
  let fixture: ComponentFixture<SendDirectMessageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SendDirectMessageComponent]
    });
    fixture = TestBed.createComponent(SendDirectMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
