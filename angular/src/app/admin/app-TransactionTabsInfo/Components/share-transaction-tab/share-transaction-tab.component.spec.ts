import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareTransactionTabComponent } from './share-transaction-tab.component';

describe('ShareTransactionTabComponent', () => {
  let component: ShareTransactionTabComponent;
  let fixture: ComponentFixture<ShareTransactionTabComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShareTransactionTabComponent]
    });
    fixture = TestBed.createComponent(ShareTransactionTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
