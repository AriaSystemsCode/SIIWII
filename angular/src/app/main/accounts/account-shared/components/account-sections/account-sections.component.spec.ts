import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountSectionsComponent } from './account-sections.component';

describe('AccountSectionsComponent', () => {
  let component: AccountSectionsComponent;
  let fixture: ComponentFixture<AccountSectionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccountSectionsComponent]
    });
    fixture = TestBed.createComponent(AccountSectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
