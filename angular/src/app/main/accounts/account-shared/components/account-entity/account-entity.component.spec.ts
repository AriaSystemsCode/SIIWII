import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountEntityComponent } from './account-entity.component';

describe('AccountEntityComponent', () => {
  let component: AccountEntityComponent;
  let fixture: ComponentFixture<AccountEntityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountEntityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountEntityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
