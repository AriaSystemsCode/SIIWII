import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityMessagesComponent } from './entity-messages.component';

describe('EntityMessagesComponent', () => {
  let component: EntityMessagesComponent;
  let fixture: ComponentFixture<EntityMessagesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EntityMessagesComponent]
    });
    fixture = TestBed.createComponent(EntityMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
