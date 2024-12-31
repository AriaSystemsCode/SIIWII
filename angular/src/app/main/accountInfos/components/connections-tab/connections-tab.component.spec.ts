import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionsTabComponent } from './connections-tab.component';

describe('ConnectionsTabComponent', () => {
  let component: ConnectionsTabComponent;
  let fixture: ComponentFixture<ConnectionsTabComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConnectionsTabComponent]
    });
    fixture = TestBed.createComponent(ConnectionsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
